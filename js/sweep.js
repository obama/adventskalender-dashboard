document.body.onload = () => {
  console.log('sweepstake script injected')

  let me = {};
  chrome.storage.local.get('options', (e) => {
    me = e.options;
    run();
  });

  /* 
   * Cosmopolitan sweepstakes
   */
  var run = function () {
    if (me && !me.email) return false;
    if (['gewinnspiel.cosmopolitan.de', 
        'gewinnspiel.autozeitung.de', 
        'gewinnspiel.wunderweib.de', 
        'gewinnspiel.tvmovie.de',
        'gewinnspiel.bravo.de',
        'gewinnspiel.wunderweib.de'].indexOf(document.location.host) >= 0) {
      let sendBtn = document.querySelector('input[type=submit][name=commit]');
      let emailInput = document.querySelector('#entry_email');
      //alert(sendBtn, emailInput)
      if (emailInput) {
        if (emailInput.value != me.email) {
          emailInput.value = me.email;
        }
        // if theres an email field and button submit
        if (sendBtn) {
          sendBtn.click()
        }
      }
      if (document.querySelector('h1.confirmation-title') || document.querySelector('.entry > p')) {
        console.log('requesting close tab')
        chrome.runtime.sendMessage({
          closeTab: true
        }, function (response) {
          console.log(response);
        });
      }
    }
  }

};