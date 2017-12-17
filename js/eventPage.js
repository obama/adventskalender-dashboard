var install = function (e) {
  if (['install', 'update'].indexOf(e.reason) >= 0) {
    pages = {}; // TODO create localstorage with presets here
    run = {
      tab: null,
      i: 0
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
  let p = browser.tabs.create({
    url: Object.keys(pages)[index]
  });
  p.then((tab) => {
    console.log('tab created', tab)
    // reset the run object
    run.tab = tab;
    run.i = index;
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
  let cur = Object.keys(pages)[run.i],
      tis = pages[cur];
  let o = {
    note: typeof tis.note == 'undefined' ? '' : tis.note,
    page: {
      url: cur,
      i: run.i,
      n: Object.keys(pages).length
    },
    form: tis.form,
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
      sendResponse(true);
      chrome.tabs.remove(sender.tab.id)
    } else if (request.startRun == true) {
      if (typeof pages === 'undefined') {
        loadPages(); // TODO run callback that sends message to dashboard
        console.log('pages was empty when starting run, dead end code :> run a callback here')
      }
      if (run.i > 0 && run.i < Object.keys(pages).length) {
        sendResponse({
          resume: true
        });
      } else {
        createRunnerTab(0);
        sendResponse(true);
      }
    } else if (request.resetAndStart == true) {
      createRunnerTab(0);
      sendResponse(true);
    } else if (request.resume == true) {
      createRunnerTab(run.i);
    } else if (request.next == true) {
      run.i += 1;
      if (run.i <= Object.keys(pages).length) {
        let p = browser.tabs.update(run.tab.id, {
          url: Object.keys(pages)[run.i]
        });
      } else {
        browser.tabs.executeScript(run.tab.id, {
          code: 'alert(`dies war die letzte seite`)'
        });
      }
    } else if (request.addNote != '') {
      pages[Object.keys(pages)[run.i]].note = request.addNote;
      console.log(pages)
      savePages();
      sendResponse(true);
    }
  }
);