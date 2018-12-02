/*
* Hier sind die background skripte, d.h. das messaging und so zeug
*/
var install = function (e) {
  if (['install', 'update'].indexOf(e.reason) >= 0) {
    console.log(e.reason +'d adventskalender tashboard')
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
    loadPages();
  }
}

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

var loadPages = function () {
  chrome.storage.local.get('pages', (e) => {
    pages = e.pages;
  });
};

var loadMyData = function () {
  chrome.storage.local.get('options', (e) => {
    myData = e.options;
  });
};

loadPages();
loadMyData();

var savePages = function () {
  let p = chrome.storage.local.set({
    pages: pages
  }, (e) => {
    console.log('saved pages')
  });
}

// is called when the tab is completed loading a website
var nextSiteLoaded = function (e) {
  console.log(e)
  if (e.tabId == run.tab.id && e.url != 'about:blank' && e.frameId == 0) {
    insertBar();
  }
}

var createRunnerTab = function (index) {
  let i = index, pk = Object.keys(pages);
  while (i < pk.length && pages[pk[i]].active === false) {
    i+=1;
  }
  let p = browser.tabs.create({
    url: pk[i]
  });
  p.then((tab) => {
    console.log('tab created', tab)
    // reset the run object
    run.tab = tab;
    run.pages = JSON.parse(JSON.stringify(pages)); // copy the pages object
    run.setIndex(i);
    console.log(run)
    // wait till tab is finished loading before inserting code
    if (!browser.webNavigation.onCompleted.hasListener(nextSiteLoaded)) {
      browser.webNavigation.onCompleted.addListener(nextSiteLoaded, {
        url: [{
          urlMatches: '.+'
        }]
      });
    }
  });
};

// inserts code the bar with the next-button into the website
var insertBar = function () {
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
    formsFilled: false
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
      if (typeof pages[currentURL].active == 'undefined') {
        pages[currentURL].active = false;
      } 
      else {
        pages[run.currentURL].active = !pages[run.currentURL].active;
      }
      savePages();
      sendResponse(pages[run.currentURL].active);
    }
    else {
      console.log('unknown message ', request);
    }
  }
);