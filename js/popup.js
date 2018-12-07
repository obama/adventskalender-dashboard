window.onload = (e) => {
    $('head').append(
        $('<style>').text(`@font-face {
          font-family: 'Material Icons';
          font-style: normal;
          font-weight: 400;
          src: local('Material Icons'),
              local('MaterialIcons-Regular'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.woff2")}) format('woff2'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.ttf")}) format('truetype'),
              url(${chrome.extension.getURL("fonts/material-icons/MaterialIcons-Regular.woff")}) format('woff')
      }`)
      )

    document.getElementById('open').onclick = function(e) {
        chrome.tabs.create({
            url: 'dashboard.html'
        });
        window.close();
    };

    document.getElementById('fillForm').onclick = function(e) {
        //alert(chrome.tabs.query)
        chrome.tabs.query({active: true}, (e)=>{
            let activeId = e[0].id;
            chrome.tabs.executeScript(activeId, {code:'document.querySelector(\'#advCalForm\').click();'});
            window.close();
        });
    };

    document.getElementById('nextPage').onclick = function(e) {
        let p = browser.runtime.sendMessage({next:true});
        addClass(e.target, 'disabled');   
        window.close(); 
    };


    document.querySelector('#deactPage').onclick = function (e) {
        chrome.runtime.sendMessage({
            toogleDeactivateCurrent: true
        }, (e) => {
            console.log('deactivate', e);
            if (e === false) {
                alert('Seite wurde deaktiviert. Sie wird beim nächsten mal nicht mehr aufgerufen. Im Dashboard kannst du sie wieder aktivieren.');
                document.querySelector('#deactPage').data['tooltip'] = 'Aktiviere die Seite wieder.';
                document.querySelector('#deactPage i').innerHTML = 'add_box';
            }
            else {
                document.querySelector('#deactPage').title = 'Deaktiviere die Seite.';
                document.querySelector('#deactPage i').innerHTML = 'report';
            }
        });
    };

    document.querySelector('#skipPage').onclick = function (e) {
        let p = chrome.runtime.sendMessage({
            next: 'skip'
        }, (e) => {
            console.log("response: ", e)
        });
        window.close(); 
    };

    $('.tooltipped').tooltip();

    let p = chrome.runtime.sendMessage({
        getRunInfo: true
    }, (e) => {
        console.log("response: ", e)
        if (e.tab != null && e.i >= 0 && e.i < Object.keys(e.pages).length) {
            $('body').css('width', '300px');
            $('.hide').removeClass('hide');
        }
    });
};


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