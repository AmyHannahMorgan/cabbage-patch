class ItemSelector {
    constructor(item) {
        this.itemName = item.name;
        this.components = this.buildComponents(item.components);
        this.vaulted = item.vaulted;
        
        this.element = itemSelectionTemplate.content.firstElementChild.cloneNode(true);
        this.element.querySelector('.itemName').innerText = this.itemName;
        this.element.querySelector('.itemImage').querySelector('img').src = `https://cdn.warframestat.us/img/${item.imageName}`
        if(this.vaulted) this.element.querySelector('.vaultedStatus').innerText = 'Vaulted';
        
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
        this.elements = [];
        this.relics = this.associateRelics(relicArray, this.elements, componentObject.drops);
        this.ducats = componentObject.ducats;
    }

    associateRelics(relicArray, elementArray, componentDrops) {
        let array = [];
        componentDrops.forEach(drop => {
            relicArray.forEach(relic => {
                if(drop.era === relic.era && drop.name === relic.name) {
                    elementArray.push(relic.associateDrop(this, drop));
                    array.push(relic);
                }
            })
        })

        return array;
    }

    update() {
        this.status = !this.status;

        if(this.status) {
            this.elements.forEach(element => {
                element.classList.add('selected');
            });
        }
        else {
            this.elements.forEach(element => {
                element.classList.remove('selected');
            })
        }

        this.relics.forEach(relic => {
            relic.update(this.fullName, this.status);
        });
    }
}

class Relic {
    constructor(relic, relicTemplate, itemTemplate, relicContainerElement) {
        let relicName = relic.name.split(' ');
        this.era = relicName[0];
        this.name = relicName[1];
        this.vaulted = relic.hasOwnProperty('drops') ? false : true;
        this.contents = [];
        
        this.element = relicContainerElement.appendChild(relicTemplate.cloneNode(true));
        this.itemElementHolder = this.element.querySelector('.relicItemList');
        this.element.querySelector('.relicName').innerText = `${this.era} ${this.name}`;
        if(this.vaulted) this.element.querySelector('.relicDisplay').classList.add('vaulted');

        this.itemTemplate = itemTemplate;
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

        let element = this.itemElementHolder.appendChild(this.itemTemplate.cloneNode(true));
        element.querySelector('.itemName').innerText = `${componentObject.fullName}`;
        element.querySelector('.itemProbability').innerText = `${Math.round(dropDetails.intact * 100)}% - ${Math.round(dropDetails.radiant * 100)}%`;

        return element
    }

    update(itemName, itemStatus) {
        let selectedFlag = false;
        this.contents.forEach(item => {
            if(item.name === itemName) {
                item.selected = itemStatus;
            }

            if(item.selected) selectedFlag = true
        });

        console.log(selectedFlag);

        if(selectedFlag) this.element.classList.add('selected')
        else this.element.classList.remove('selected');
        console.log(this.element);

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
const relicDisplayTemplate = document.querySelector('#relicWrapperTemplate');
const relicItemTemplate = document.querySelector('#relicItemTemplate');
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
        outputArray.push(new Relic(relic, relicDisplayTemplate.content.firstElementChild, relicItemTemplate.content.firstElementChild, document.querySelector('#relicInfo')));
    });
}