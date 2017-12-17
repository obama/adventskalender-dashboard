window.onload = (e) => {
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