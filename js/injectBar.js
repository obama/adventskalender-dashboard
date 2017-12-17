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
                                <i class="material-icons">check_box</i>
                            </a>
                        </li>
                        <li>
                            <a id="advCalNote" class="btn-floating waves-effect waves-light green" title="notiz hinzufügen">
                                <i class="material-icons">edit</i>
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

    document.querySelector('#advCalForm').onclick = function (e) {
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
        /*for (let x of iframes) {
            l.push(x);
        }*/
        l.push(document);
        let f = advCal.form || {};
        for (let i of l) {
            //console.log(i, i.contentWindow)
            let inputs = i.querySelectorAll('input,select');
            console.log(inputs, f)
            for (let x of inputs) {
                if (!advCal.formsFilled) {
                    if (x.type == 'hidden') {
                        continue;
                    }
                    // some forms dont have name but id, fix that?
                    //console.log(x,x.name,x.id)
                    if (!x.name && x.id) {
                        console.log('setting name for ',x)
                        x.name = x.id;
                    }

                    if (x.type == 'checkbox' && f[x.name]) {
                        x.checked = f[x.name] ? true : false;
                        x.value = x.checked;
                    } 
                    else if (x.type == 'radio') {
                        /*const [selected] = [...els].filter(el => el.value === options[name]);
                        if (selected) {
                            selected.checked = true;
                        }*/
                    }
                    // selects might have a default value like "none" so we treat them separately
                    else if (x.nodeName == 'SELECT') {
                        let val = undefined;
                        if (f[x.name]) {
                            val = f[x.name]
                        }
                        else {
                            for (let m in mappings) {
                                if (mappings[m].indexOf(x.name.toLowerCase()) >= 0) {
                                    val = advCal.myData[m];
                                }
                            }
                        }
                        x.value = val;
                    }
                    else if (!x.value) {
                        if (f[x.name]) {
                            x.value = f[x.name];
                        } else if (advCal.myData[x.name.toLowerCase()]) {
                            x.value = advCal.myData[x.name.toLowerCase()];
                        } else {
                            for (let m in mappings) {
                                if (mappings[m].indexOf(x.name.toLowerCase()) >= 0) {
                                    x.value = advCal.myData[m];
                                }
                            }
                        }
                    }
                }
                //console.log(x, x.name, x.value);
                let saveVal = undefined;
                switch (x.type) {
                    case 'checkbox':
                        saveVal = x.checked;
                    break;
                    default:
                        saveVal = x.value;
                    break;
                }
                f[x.name] = saveVal;
            }
            //console.log(f);
            // save form data
            chrome.storage.local.get('pages', (e) => {
                let pages = e.pages;
                pages[advCal.page.url].form = f;
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