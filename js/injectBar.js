function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}

function insert() {
    document.querySelector('head').insertAdjacentHTML('afterbegin', '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">');
    // using packaged font doesnt work somehow 
    /*document.querySelector('head').insertAdjacentHTML('afterbegin', `
    <style type="text/css">    
    @font-face {
          font-family: 'Material Icons';
          font-style: normal;
          font-weight: 400;
          src: local('Material Icons'),
              local('MaterialIcons-Regular'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.woff2")}) format('woff2'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.ttf")}) format('truetype'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.woff")}) format('woff')
    }
    .material-icons {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px; 
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
      }
    </style>`);*/

    if (advCal.nextURL != null) {
        // preload next website, to reduce loading times
        document.querySelector('head').insertAdjacentHTML('afterbegin', `<link rel="preload" as="document" crossorigin="use-credentials" href="${advCal.nextURL}">`);
    }


    document.querySelector('body')
        .insertAdjacentHTML('afterbegin',
            `<div id="adventBar">
        <div class="navbar-fixed" style="z-index:999999999;">
            <nav>
                <div class="nav-wrapper blue">
                    <a href="#!" class="brand-logo center">
                        Adventskalender Bar
                    </a>
                    <ul class="right hide-on-med-and-down" style="display:block">
                        <li>
                            <a id="advCalForm" class="btn-floating waves-effect waves-light black" title="fülle die felder aus und speichere sie">
                                <i class="material-icons">save</i>
                            </a>
                        </li>
                        <li>
                            <a id="advCalNote" class="btn-floating waves-effect waves-light green" title="notiz hinzufügen">
                                <i class="material-icons">add_comment</i>
                            </a>
                        </li>
                        <li>
                            <a id="advCalDeak" class="btn-floating waves-effect waves-light grey darken-1" title="deaktiviere diese seite">
                                <i class="material-icons">report</i>
                            </a>
                        </li>
                        <li>
                            <a id="advCalSkip" class="btn-floating waves-effect waves-light red darken-2" title="überspringe diese seite">
                                <i class="material-icons">redo</i>
                            </a>
                        </li>
                        <li>
                            <a id="advCalNext" class="btn-floating waves-effect waves-light red" title="nächste seite">
                                <i class="material-icons">keyboard_arrow_right</i>
                            </a>
                        </li>
                        <li style="width:60px">
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>`);

    var adcnxtbtn = document.querySelector('#advCalNext');

    adcnxtbtn.onclick = function (e) {
        let p = chrome.runtime.sendMessage({
            next: true
        }, (e) => {
            console.log("response: ", e)
        });
        addClass(adcnxtbtn, 'disabled');
    };

    document.querySelector('#advCalNote').onclick = function (e) {
        let t = prompt('Notiz: ', advCal.note);
        if (t == null) return;
        chrome.runtime.sendMessage({
            addNote: t
        }, (e) => {
            console.log('note added', e)
            advCal.note = t;
            document.querySelector('.brand-logo.center').insertAdjacentHTML('beforeend', `<span class="small"> Notiz: ${advCal.note}</span>`);
        })
    };

    document.querySelector('#advCalDeak').onclick = function (e) {
        chrome.runtime.sendMessage({
            toogleDeactivateCurrent: true
        }, (e) => {
            console.log('deactivate', e);
            if (e === false) {
                alert('Seite wurde deaktiviert. Sie wird beim nächsten mal nicht mehr aufgerufen. Im Dashboard kannst du sie wieder aktivieren.');
                document.querySelector('#advCalDeak').title = 'Aktiviere die Seite wieder.';
                document.querySelector('#advCalDeak i').innerHTML = 'add_box';
            }
            else {
                document.querySelector('#advCalDeak').title = 'Deaktiviere die Seite.';
                document.querySelector('#advCalDeak i').innerHTML = 'report';
            }
        });
    };

    document.querySelector('#advCalSkip').onclick = function (e) {
        let p = chrome.runtime.sendMessage({
            next: 'skip'
        }, (e) => {
            console.log("response: ", e)
        });
        addClass(document.querySelector('#advCalSkip'), 'disabled');
    };

    var advCalForm = document.querySelector('#advCalForm');

    console.log(advCal.form)
    if (typeof advCal.form != 'undefined') {
        let i = advCalForm.querySelector('i');
        i.innerHTML = 'edit';
        i.title = 'Fülle Formular mit zuvor gespeicherten Daten aus bzw. speichere geänderte Daten';
    }

    advCalForm.onclick = function (e) {
        // define alias names for form fields here:
        let mappings = {
            houseno: ['streetnumber'],
            postal: ['zipcode'],
            place: ['city'],
            surname: ['lastname']
        };

        let iframes = document.querySelectorAll('iframe'),
            l = [];
        // for now only for forms in the document ignore frames
        // to make iframes work we probably need to make a content script that is injected into subframes, not try to access them
        /*for (let x of iframes) {
            l.push(x);
        }*/
        l.push(document);
        let f = advCal.form || {};
        for (let i of l) {
            //console.log(i, i.contentWindow)
            let inputs = i.querySelectorAll('input,select');
            for (let x of inputs) {
                if (!advCal.formsFilled) {
                    if (x.type == 'hidden') {
                        continue;
                    }
                    // some forms dont have name but id, fix that?
                    //console.log(x,x.name,x.id)
                    if (!x.name && x.id) {
                        x.name = x.id;
                    }

                    if (x.type == 'checkbox' && f[x.name]) {
                        x.checked = f[x.name] ? true : false;
                        x.value = x.checked;
                    } 
                    else if (x.type == 'radio' && f[x.name]) {
                        if (x.value == f[x.name]) {
                            x.checked = true;
                        }
                    }
                    else if (x.nodeName == 'SELECT') {
                        let val = undefined;
                        if (f[x.name]) {
                            val = f[x.name];
                            let i = 0;
                            for (let o of x.options) {
                                o.selected = false;
                                if (o.value != '' && o.value == f[x.name]) {
                                    o.selected = true;
                                    x.options.selectedIndex = i;
                                }
                                i++;
                            }
                        }
                    }
                    else if (!x.value || x.value == '') {
                        if (f[x.name]) {
                            x.value = f[x.name];
                        }
                        else if (typeof advCal.myData != 'undefined') {
                            if (advCal.myData[x.name.toLowerCase()]) {
                                x.value = advCal.myData[x.name.toLowerCase()];
                            } 
                            else {
                                for (let m in mappings) {
                                    if (mappings[m].indexOf(x.name.toLowerCase()) >= 0) {
                                        x.value = advCal.myData[m];
                                    }
                                }
                            }
                        }                           
                    }
                }
                // fire on change event manually
                let e = new Event('change');
                x.dispatchEvent(e); 
                //console.log(x, x.name, x.value);
                let saveVal = undefined;
                if (x.nodeName == 'SELECT') {
                    for (let o of x.options) {
                        if (o.selected) {
                            saveVal = o.value;
                        }
                    }
                }
                else {
                    switch (x.type) {
                        case 'checkbox':
                            saveVal = x.checked;
                        break;
                        default:
                            saveVal = x.value;
                        break;
                    }
                }
                f[x.name] = saveVal;
            }
            // save form data
            chrome.storage.local.get('pages', (e) => {
                let pages = e.pages;
                pages[advCal.page.url].form = f;
                //alert('Eingaben wurden gespeichert.');
                //console.log(pages)
                chrome.storage.local.set({
                    pages: pages
                }, (e) => {
                    advCal.formsFilled = true;
                    console.log('saved pages')
                })
            })
        }
    }

    document.querySelector('.brand-logo.center').textContent += ` #${advCal.page.i+1}/${advCal.page.n}`;
    if (advCal.note != '') {
        document.querySelector('.brand-logo.center').insertAdjacentHTML('beforeend', `<span class="small"> Notiz: ${advCal.note}</span>`);
    }

}

// insert only if advCal object is existant and was not inserted before
if (typeof advCal != 'undefined' && !advCal.inserted) {
    insert();
    advCal.inserted = true;
}