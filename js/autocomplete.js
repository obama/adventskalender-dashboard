// fix autocomplete. its in a signle file because this has to run for allFrames
console.log('enabling autocomplete')
for (let x of document.querySelectorAll('[autocomplete=off')) {
    x.autocomplete = 'on';
}