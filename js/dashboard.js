$(document).ready(function () {
  $('.datepicker').datepicker({
    format: 'DD.MM.YYYY',
    yearRange: [1930, 2018]
  });

  // module for auto saving the form data in the "my info"
  new OptionsSync().syncForm('#myData');

  $('.tabs').tabs();
  $('.modal').modal();

  $('.card-image-image')
    .css('background-image', `url(${chrome.extension.getURL("img/"+["bg1.jpg", "bg2.png"][(new Date()).getDay() % 2])})`);

  $('#btnStart').click((e) => {
    if (Object.keys(pages).length == 0) {
      infoModal({header:'Fehler', text:'Du hast noch keine Seiten hinzugefügt. Unter Einstellungen kannst du die Liste von MyDealz runterladen.'});
      return;
    }
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


  document.forms.addPage.url.addEventListener('paste', (e) => {
    let p = '', count = 0, m = null;
    console.log(e.clipboardData.types)
    if (e.clipboardData.types.includes('text/html')) {
      p = e.clipboardData.getData('text/html');
    } else if (e.clipboardData.types.includes('text/plain')) {
      p = e.clipboardData.getData('text/plain');
    }
    if (p != '') {
      // filter out mydealz redirect - URL will be grabbed from title attribute instead
      m = (p.match(/((https?:\/\/|[^\/]www\.)[\w%=\?!\.\/\-#\[\]\+@\$&\(\);,\*']+)/g) || []);
      // sort to remove duplicate entries
      m = m.filter(w => w.indexOf('mydealz.de/visit/') < 0).sort().filter(function(item, pos, ary) { return !pos || item != ary[pos - 1]; })
      if (m.length == 0) {
        infoModal({header:'Fehler', text:'keine Links in der Zwischenablage gefunden. (Hinweis: mydealz redirects werden rausgefiltert xD bitte echte URL finden.)'});
        return;
      }
      // filter out sites that are already added
      m = m.filter(e => !(e in pages));
      if (m.length == 0) {
        infoModal({header:'Fehler', text:'Alle links bereits vorhanden.'});
        return;
      }
      // if HTML is found add automatically even if only 1 link, for text/plain expect 2 or more links
      if ((e.clipboardData.types.includes('text/html') && m.length > 0) || m.length > 1)  {
        m.forEach((v, i) => addPage(v));
        // clear form and save data
        document.forms.addPage.elements[0].value = '';
        buildPageCollection();
        savePages();
        e.stopPropagation();
        e.preventDefault();
        infoModal({header:'Links hinzugefügt', text: m.length+' Links wurden hinzugefügt.' });
      }
    } else {
      infoModal({header:'Fehler', text:'Die Zwischenablage enthielt keine text oder html daten.' })
    }
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

  $('#importmydealz').click(e => {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', p => {
      console.log(p.target.responseText);

      // TODO: refactor, weil selber code wie im paste event..
      // filter out mydealz redirect - URL will be grabbed from title attribute instead
      let m = (p.target.responseText.match(/((https?:\/\/|[^\/]www\.)[\w%=\?!\.\/\-#\[\]\+@\$&\(\);,\*']+)/g) || []);
      // sort to remove duplicate entries
      m = m.filter(w => w.indexOf('mydealz.de/visit/') < 0).sort().filter(function(item, pos, ary) { return !pos || item != ary[pos - 1]; })
      if (m.length == 0) {
        infoModal({header:'Fehler', text:'keine Links gefunden. (Hinweis: mydealz redirects werden rausgefiltert xD bitte echte URL finden.)'});
        $('#importmydealz').removeClass('disabled');
        return;
      }
      // filter out sites that are already added
      m = m.filter(e => !(e in pages));
      if (m.length == 0) {
        infoModal({header:'Fehler', text:'Alle links bereits vorhanden.'});
        $('#importmydealz').removeClass('disabled');
        return;
      }
      m.forEach((v, i) => addPage(v));
      buildPageCollection();
      savePages();
      infoModal({header:'Links hinzugefügt', text: m.length+' Links wurden hinzugefügt.' });
      $('#importmydealz').removeClass('disabled');
    });

    xhr.addEventListener('error', err => {
      infoModal({header:'Fehler', text:'Es ist ein Fehler aufgetreten.'});
      console.log(err)
      $('#importmydealz').removeClass('disabled');
    })
    xhr.open('GET', 'https://bluvado.de/advent18/parser.php?methode=linksOnly');
    xhr.send();
    $('#importmydealz').addClass('disabled');
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
  // strip trailing /
  let s = site;
  if (site.substring(site.length-1, site.length) == '/') {
    s = site.substring(0, site.length-1);
  }
  if (s in pages) {
    infoModal({
      header: 'Fehler',
      text: `Seite ${s} bereits vorhanden`
    });
    return;
  }
  pages[s] = opt;
  // call buildPagesList() etc outside this function
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