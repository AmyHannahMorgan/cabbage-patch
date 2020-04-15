class itemSelector {
    constructor(item) {
        this.itemName = item.name;
        this.components = item.components.filter(component => {
            let regex = /blueprint|chassis|helmet|systems|barrel|stock|receiver|grip|string|lower limb|upper limb|link| prime|blade|gauntlet|handle|ornament|chain/i;
            return regex.test(component.name);
        });
        this.vaulted = item.hasOwnProperty('vaulted') ? item.hasOwnProperty('vaulted') : false;
        this.element = itemSelectionTemplate.content.cloneNode(true);
        this.element.querySelector('.itemImage').querySelector('img').src = `https://cdn.warframestat.us/img/${item.imageName}`
        itemSelect.appendChild(this.element);
    }
}

const itemSelect = document.querySelector('#itemSelect');
const itemSelectionTemplate = document.querySelector('#itemSelectionTemplate');
let itemselectors = [];

fetch('/api/all/').then(response => response.json())
.then(json => {
    console.log(json);
    bulidItemSelectors(json.warframes);
    console.log(itemselectors);
});

function bulidItemSelectors(array) {
    array.forEach(item => {
        itemselectors.push(new itemSelector(item));
    })
}