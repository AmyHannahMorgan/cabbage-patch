class ItemSelector {
    constructor(item) {
        this.itemName = item.name;
        this.components = this.buildComponents(item.components);
        this.vaulted = item.vaulted;
        this.element = itemSelectionTemplate.content.cloneNode(true);
        this.element.querySelector('.itemName').innerText = this.itemName;
        this.element.querySelector('.itemImage').querySelector('img').src = `https://cdn.warframestat.us/img/${item.imageName}`
        this.components.forEach(component => {
            let element = itemWrapperTemplate.content.cloneNode(true).firstElementChild;
            element.querySelector('label').htmlFor = component.name;
            element.querySelector('label').innerText = component.name;
            element.querySelector('input').name = component.name;
            this.element.querySelector('.itemOptions').appendChild(element).querySelector('input').addEventListener('click', e => {
                component.update();
            });;
        });
        itemSelect.appendChild(this.element);
    }

    buildComponents(componentArray) {
        let array = [];
        componentArray.forEach(component => {
            array.push(new Component(component, this.itemName, relics));
        })
        return array;
    }
}

class Component {
    constructor(componentObject, parentItemName, relicArray) {
        this.fullName = `${parentItemName} ${componentObject.name}`;
        this.name = componentObject.name;
        this.status = false;
        this.relics = this.associateRelics(relicArray, componentObject.drops);
        this.ducats = componentObject.ducats;
    }

    associateRelics(relicArray, componentDrops) {
        let array = [];
        componentDrops.forEach(drop => {
            relicArray.forEach(relic => {
                if(drop.era === relic.era && drop.name === relic.name) {
                    relic.associateDrop(this, drop);
                    array.push(relic);
                }
            })
        })

        return array;
    }

    update() {
        this.status = !this.status;
        this.relics.forEach(relic => {
            relic.update(this.fullName, this.status);
        });
    }
}

class Relic {
    constructor(relic) {
        let relicName = relic.name.split(' ');
        this.era = relicName[0];
        this.name = relicName[1];
        this.contents = [];
    }

    associateDrop(componentObject, dropDetails) {
        this.contents.push({
            name: componentObject.fullName,
            selected: false,
            intact: dropDetails.intact,
            exceptional: dropDetails.exceptional,
            flawless: dropDetails.flawless,
            radiant: dropDetails.radiant,
        });
    }

    update(itemName, itemStatus) {
        this.contents.forEach(item => {
            if(item.name === itemName) {
                item.selected = itemStatus;
            }
        });
        console.log(this.contents);
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
let relics = [];

fetch('/api/all/').then(response => response.json())
.then(json => {
    console.log(json);
    buildRelics(json.relics.available, relics);
    buildRelics(json.relics.vaulted, relics);
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

function buildRelics(relicArray, outputArray) {
    relicArray.forEach(relic => {
        outputArray.push(new Relic(relic));
    });
}