class ItemSelector {
    constructor(item) {
        this.itemName = item.name;
        this.components = item.components.filter(component => {
            let regex = /blueprint|chassis|neuroptics|systems|barrel|stock|receiver|grip|string|lower limb|upper limb|link| prime|blade|gauntlet|handle|ornament|chain|pouch|stars/i;
            return regex.test(component.name);
        });
        this.vaulted = item.hasOwnProperty('vaulted') ? item.hasOwnProperty('vaulted') : false;
        this.element = itemSelectionTemplate.content.cloneNode(true);
        this.element.querySelector('.itemName').innerText = this.itemName;
        this.element.querySelector('.itemImage').querySelector('img').src = `https://cdn.warframestat.us/img/${item.imageName}`
        this.components.forEach(component => {
            let element = itemWrapperTemplate.content.cloneNode(true).firstElementChild;
            element.querySelector('label').htmlFor = component.name;
            element.querySelector('label').innerText = component.name;
            element.querySelector('input').name = component.name;
            this.element.querySelector('.itemOptions').appendChild(element).querySelector('input').addEventListener('click', e => {
                console.log(`${this.itemName} ${component.name}`);
            });;
        });
        itemSelect.appendChild(this.element);
    }
}

class Relic {
    constructor(relic, itemList) {
        let relicName = relic.name.split(' ');
        this.era = relicName[0];
        this.name = relicName[1];
    }
}

class TabHandler {
    constructor(selectArray, tabArray) {
        this.tabSelectors = [];

        selectArray.forEach(selector => {
            for(let i = 0; i < tabArray.length; i++) {
                if(tabArray[i].id === selector.getAttribute('tabID')) {
                    this.tabSelectors.push(new TabSelect(selector, tabArray[i], this));
                    break;
                }
            }
        })

        this.tabSelectors[0].active = true
        this.tabSelectors[0].tab.classList.add('active');
        this.tabSelectors[0].selector.classList.add('active');
    }

    changeActive(activeTabId) {
        this.tabSelectors.forEach(tabSelector => {
            tabSelector.active = false;
            tabSelector.selector.classList.remove('active');

            if(tabSelector.tab.id === activeTabId) tabSelector.tab.classList.add('active')
            else tabSelector.tab.classList.remove('active');
        })
    }
}

class TabSelect {
    constructor(seletor, tab, handler) {
        this.selector = seletor;
        this.tab = tab;
        this.handler = handler;
        this.active = false;

        this.selector.addEventListener('click', () => {
            if(!this.active) {
                this.handler.changeActive(this.tab.id);
                this.selector.classList.add('active');
                this.active = true;
            }
        })
    }
}

const tabSelectors = document.querySelectorAll('.tabSelectHolder');
const tabs = document.querySelectorAll('.tab');
let tabHandlers = [];

for(let i = 0; i < tabSelectors.length; i++) {
    tabHandlers.push(new TabHandler(tabSelectors[i].querySelectorAll('.tabSelect'), tabs));
}

const itemSelect = document.querySelector('#itemSelect');
const itemSelectionTemplate = document.querySelector('#itemSelectionTemplate');
const itemWrapperTemplate = document.querySelector('#itemWrapperTemplate');
let itemselectors = [];

fetch('/api/all/').then(response => response.json())
.then(json => {
    console.log(json);
    bulidItemSelectors(json.warframes);
    bulidItemSelectors(json.primary);
    bulidItemSelectors(json.secondary);
    bulidItemSelectors(json.melee);
});

function bulidItemSelectors(array) {
    array.forEach(item => {
        itemselectors.push(new ItemSelector(item));
    })
}