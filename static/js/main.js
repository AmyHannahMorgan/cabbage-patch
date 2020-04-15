const itemSelect = document.querySelector('#itemSelect');
const templates = document.querySelector('template');
const itemSelectionTemplate = templates.querySelector('#itemSelectionTemplate');

fetch('/api/all/').then(response => response.json())
.then(json => {
    console.log(json);
})