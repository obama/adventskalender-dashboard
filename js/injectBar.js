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