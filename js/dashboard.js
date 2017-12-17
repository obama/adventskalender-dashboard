$(document).ready(function () {
  $('.datepicker').datepicker({
    format: 'DD.MM.YYYY',
    yearRange: [1930, 2017]
  });

  // module for auto saving the form data in the "my info"
  new OptionsSync().syncForm('#myData');

  $('.tabs').tabs();
  $('.modal').modal();

  $('.card-image-image')
    .css('background-image', `url(${chrome.extension.getURL("img/bg1.jpg")})`);

  $('#btnStart').click((e) => {
    console.log('sending start message')
    chrome.runtime.sendMessage({
      startRun: true
    },(e)=>{
      if (e && e.resume) {
        confirmModal({
          header:'Fortsetzen?', 
          text:'wie es scheint hast du das letzte mal nicht alle seiten besucht. Willst du dort weitermachen wo du aufgehört hast? Klick auf Nein startet von 0.',
          yes:(e)=>{
            browser.runtime.sendMessage({resume:true});
          },
          no:(e)=>{
            browser.runtime.sendMessage({resetAndStart:true});
          }
        });
      }
    });
  });

  $('#addPage').click((e) => {
    let f = document.forms.addPage;
    if (f.checkValidity()) {
      _submit();
    } else {
      infoModal({header:'Fehler', text:'Bitte gebe eine komplette URL ein mit http(s)://'})
    }
  });

  $('form[name=addPage]').submit((e) => {
    e.stopPropagation();
    _submit();
    return false;
  });

  $('#importJson').click((e)=>{
    let j = JSON.parse($('#exportData textarea').val());
    if ('pages' in j && j.pages != {}) {
      pages = j.pages;
      savePages();
      buildPageCollection();
      infoModal({header: 'Import', text:'import erfolgt.'})
    }
    else {
      infoModal({header: 'Fehler', text:'es ist ein Fehler aufgetreten oder die Liste ist leer.'})
    }
  });

  loadPages();

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace == 'local') {
      for (key in changes) {
        if (key == 'pages') {
          pages = changes[key].newValue;
        }
        console.log('dashboard: reloaded pages');
        fillJSONTextarea();
      }
    }
  });
});

// on submitting the add page form
var _submit = function () {
  let f = document.forms.addPage;
  addPage(f.elements[0].value, {
    lastVisit: null
  })
  f.elements[0].value = '';
  buildPageCollection();
  savePages();
};

// create a modal with yes or no button
var confirmModal = function ({
  header = 'header',
  text = 'text',
  yes = () => true,
  no = () => true
} = {}) {
  let m = $('#modalConfirm');
  m.find('h4').text(header);
  m.find('p').text(text)
  m.find('#modalConfirmYes').get(0).onclick = yes;
  m.find('#modalConfirmNo').get(0).onclick= no;
  let instance = M.Modal.getInstance(m);
  instance.open();
  return instance;
}

var infoModal = function ({
  header = 'header',
  text = 'text',
  f = (e => true)
} = {}) {
  let m = $('#modalInfo');
  m.find('h4').text(header);
  m.find('p').html(text)
  let instance = M.Modal.getInstance(m);
  instance.open();
  return instance;
}

var fillJSONTextarea = function() {
  $('#exportData textarea')
  .val(JSON.stringify({pages:pages}))
  .trigger('autoresize');
}

var addPage = function (site, opt = {}) {
  if (site in pages) {
    infoModal({
      header: 'Fehler',
      text: 'Seite bereits vorhanden'
    });
    return;
  }
  pages[site] = opt;
}

// load saved pages
var loadPages = function () {
  let p = chrome.storage.local.get('pages', (e) => {
    pages = e.pages || {};

    buildPageCollection();

    fillJSONTextarea();    
  });
};

var savePages = function () {
  let p = chrome.storage.local.set({
    pages: pages
  }, (e) => {
    console.log('saved pages')
  });
}

var deletePage = function (page) {
  delete pages[page];
  savePages();
}


var buildPageCollection = function () {
  $('#cardPageList h4').text(`Seiten: ${Object.keys(pages).length}`);

  let list = $('#pageList');
  list.empty();
  for (let o of Object.keys(pages).reverse()) {
    //console.log('adding ', o)
    $('<li>')
      .addClass('collection-item')
      .append(
        $('<a>')
        .attr('href', o)
        .attr('target', 'viewer')
        .text(o)
      )
      .append(
        $('<a>')
        .attr('href', '#!')
        .attr('title', 'löschen')
        .addClass('secondary-content')
        .append(
          $('<i>')
          .addClass('material-icons red-text')
          .text('clear')
        )
        .click((e) => {
          confirmModal({
            header: 'Löschen bestätigen',
            text: `${o} wirklich löschen?`,
            yes: () => {
              deletePage(o);
              buildPageCollection();
            }
          })
        })
      )
      .append(
        $('<a>')
        .attr('href', '#!')
        .attr('title', 'einstellungen')
        .addClass('secondary-content')
        .append(
          $('<i>')
          .addClass('material-icons grey-text')
          .text('settings')
        )
        .click((e) => {
          return true;
        })
      )
      .appendTo(list)
  }
}