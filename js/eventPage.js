/*
* Hier sind die background skripte, d.h. das messaging und so zeug
*/
function install(e) {
  if (['install', 'update'].indexOf(e.reason) >= 0) {
    console.log(e.reason +'d adventskalender tashboard')
  }
}

function init() {
  win = null;
  pages = {}; // TODO create localstorage with presets here
  // run is a object holding information about the position of the current visited adventskalender and holds a copy of pages, so that you can manipulate the actual pages object
  run = {
    tab: null,
    i: 0,
    pages: {},
    currentPage: null,
    currentURL: null,
    setIndex: (v) => {
      run.i = v;
      if (run.i < Object.keys(run.pages).length) {
        run.currentURL = Object.keys(run.pages)[run.i];
        run.currentPage = run.pages[run.currentURL];
        return true;
      }
      return false;
    },
    nextPage: () => {
      return run.setIndex(run.i + 1);
    },
    numPages: () => Object.keys(run.pages).length
  };
  loadMyData();
  loadPages();
};

init();

chrome.runtime.onInstalled.addListener(install);

browser.browserAction.setIcon({
  path: 'img/icon.svg'
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace == 'local') {
    for (key in changes) {
      if (key == 'pages') {
        pages = changes[key].newValue;
      }
      if (key == 'options') {
        myData = changes[key].newValue;
      }
      console.log('eventpage: reloaded pages');
    }
  }
});

function loadPages() {
  chrome.storage.local.get('pages', (e) => {
    pages = e.pages;
  });
};

function loadMyData() {
  chrome.storage.local.get('options', (e) => {
    myData = e.options;
  });
};



 function savePages() {
  let p = chrome.storage.local.set({
    pages: pages
  }, (e) => {
    console.log('saved pages')
  });
}

// is called when the tab is completed loading a website
function nextSiteLoaded(e) {
  browser.tabs.get(e.tabId)
  .then(p => {
    if (win == p.windowId && run.tab && p.id == run.tab.id && p.url != 'about:blank' && e.frameId == 0) {
      console.log('trying to inject bar')
      insertBar();
    }
  }, err => console.log(err));
}

function createRunnerTab(index) {
  let i = index, 
      _pages = Object.keys(pages).filter((v, i) => pages[v].active || typeof pages[v].active == 'undefined'),
      y = {};
  for (let x of _pages) {
    y[x] = JSON.parse(JSON.stringify(pages[x]));
  }
  let p = browser.tabs.create({
    url: _pages[i],
    windowId: win
  });
  p.then((tab) => {
    console.log('tab created', tab)
    // reset the run object
    run.tab = tab;
    run.pages = y; // copy the pages object but only active pages
    run.setIndex(i);
    console.log(run)
    // wait till tab is finished loading before inserting code
    if (!browser.webNavigation.onDOMContentLoaded.hasListener(nextSiteLoaded)) {
      browser.webNavigation.onDOMContentLoaded.addListener(nextSiteLoaded, {
        url: [{
          urlMatches: '.+'
        }]
      });
    }
  });
};

browser.tabs.onRemoved.addListener((id, info) => {
  if (typeof run != 'undefined' && run.tab && id == run.tab.id) {
    run.tab = null;
  }
});

browser.windows.onRemoved.addListener((id, info) => {
  if (id == win) {
    win = null;
  }
});

// inserts code the bar with the next-button into the website
function insertBar() {
  // insert the CSS
  chrome.tabs.insertCSS(run.tab.id, {
    file: 'css/injectBar.css'
  })
  // turn autocomplete on
  let p = browser.tabs.executeScript(run.tab.id, {
    file: 'js/autocomplete.js',
    allFrames: true
  });
  // insert variable ;D
  console.log(run)
  let o = {
    note: typeof run.currentPage.note == 'undefined' ? '' : run.currentPage.note,
    page: {
      url: run.currentURL,
      i: run.i,
      n: run.numPages()
    },
    form: run.currentPage.form,
    myData: myData,
    formsFilled: false,
    nextURL: run.i+1 < run.numPages() ? Object.keys(run.pages)[run.i+1] : null
  };

  browser.tabs.executeScript(run.tab.id, {
    code: `advCal = ${JSON.stringify(o)}`
  });

  // insert the JS
  let pp = browser.tabs.executeScript(run.tab.id, {
    file: 'js/injectBar.js'
  });
  pp.then((e) => console.log('executeScript ', e)); // oddly never fires, though file is injected?
}




chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension: ", request);
     
    if (request.closeTab == true) {
      console.log('closing tab')
      sendResponse(true);
      chrome.tabs.remove(sender.tab.id);
    } 
    else if (request.startRun == true) {
      console.log('got startRun')
      if (typeof pages === 'undefined') {
        loadPages(); // TODO run callback that sends message to dashboard
        console.log('pages was empty when starting run, dead end code :> run a callback here')
      }
      if (run.i > 0 && run.i < run.numPages()) {
        sendResponse({
          resume: true
        });
      } else {
        
        createRunnerTab(0);
        sendResponse(true);
      }
    } 
    else if (request.resetAndStart == true) {
      console.log('restarting run')
      createRunnerTab(0);
      sendResponse(true);
    } 
    else if (request.resume == true) {
      console.log('resuming')
      createRunnerTab(run.i);
    } 
    else if (typeof request.next !== 'undefined') {
      console.log('going to next page')
      // setze zeit wann seite zuletzt besucht wurde, falls nicht geskippt wird
      if (request.next != 'skip') {
        pages[run.currentURL].lastVisit = new Date().getTime();
        console.log('saved lastVisit')
      }
      else {
        // anzahl der skips erhoehen, vlt wird das später mal zum sortieren genutzt..
        pages[run.currentURL].skip = (pages[run.currentURL].skip ? pages[run.currentURL].skip : 0) + 1;
      }
      savePages();

      // gehe zur nächsten seite
      run.nextPage();
      // wenn seite deaktiviert wurde, nimme nächste seite
      while (run.i < run.numPages() && run.currentPage.active === false) {
        run.nextPage();
      }
      if (run.i < run.numPages()) {
        let p = browser.tabs.update(run.tab.id, {
          url: run.currentURL
        });
      } 
      else {
        browser.tabs.executeScript(run.tab.id, {
          code: 'alert(`dies war die letzte seite`)'
        });
      }
    } 
    else if (typeof request.addNote !== 'undefined' && request.addNote != '') {
      console.log('adding note')
      pages[run.currentURL].note = request.addNote;
      savePages();
      sendResponse(true);
    }
    else if (request.toogleDeactivateCurrent == true) {
      console.log('de/activating '+run.currentURL)
      if (typeof pages[run.currentURL].active == 'undefined') {
        pages[run.currentURL].active = false;
      } 
      else {
        pages[run.currentURL].active = !pages[run.currentURL].active;
      }
      savePages();
      sendResponse(pages[run.currentURL].active);
    }
    else if (request.getRunInfo == true) {
      sendResponse(run);
    }
    else if (request.openDashboard == true) {
      if (win == null) {
        let p = browser.windows.create({
          url: 'dashboard.html',
          state: 'maximized'
        });
        p.then(e => {
          win = e.id; 
        }, e => {console.log(e)});
      }
      else {
        browser.windows.update(
          win,
          {
            focused: true
          });
      }
    } 
    else {
      console.log('unknown message ', request);
    }
  }
);