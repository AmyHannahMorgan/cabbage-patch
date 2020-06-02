class ItemSelector {
    constructor(item) {
        this.itemName = item.name;
        this.components = this.buildComponents(item.components);
        this.vaulted = item.vaulted;
        this.type = item.type;
        
        this.element = itemSelectionTemplate.content.firstElementChild.cloneNode(true);
        this.element.querySelector('.itemName').innerText = this.itemName;
        this.element.querySelector('.itemImage').querySelector('img').src = `https://cdn.warframestat.us/img/${item.imageName}`
        if(this.vaulted) {
            this.element.querySelector('.vaultedStatus').innerText = 'Vaulted';
            this.element.classList.add('vaulted');
        }
        
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

    filter(string) {
        if(string.length > 0) {
            let regexp = new RegExp(string, 'i');
            if(!regexp.test(this.itemName)) {
                this.element.classList.add('filtered');
            }
            else this.element.classList.remove('filtered');
        }
        else this.element.classList.remove('filtered');
    }

    filterType(itemType, filter) {
        if(itemType === this.type) {
            if(filter) this.element.classList.add('filtered')
            else this.element.classList.remove('filtered')
        }
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
                    elementArray.push(relic.associateItem(this, drop));
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
    constructor(relic, relicTemplate, itemTemplate, relicContainerElement, dropArray) {
        let relicName = relic.name.split(' ');
        this.era = relicName[0];
        this.name = relicName[1];
        this.fullName = `${this.era} ${this.name}`
        this.chance = relic.chance;
        this.vaulted = relic.hasOwnProperty('drops') ? false : true;
        this.selected = false;
        this.contents = [];
        if(!this.vaulted) {
            this.elementArray = [];
            this.drops = this.associateDrop(relic.drops, dropArray);
        }
        
        this.element = relicContainerElement.appendChild(relicTemplate.cloneNode(true));
        this.itemElementHolder = this.element.querySelector('.relicItemList');
        this.element.querySelector('.relicName').innerText = `${this.era} ${this.name}`;
        if(this.vaulted) this.element.querySelector('.relicDisplay').classList.add('vaulted');

        this.itemTemplate = itemTemplate;
    }

    associateItem(componentObject, dropDetails) {
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

    associateDrop(selfDropArray, dropArray) {
        console.log(selfDropArray)
        console.log(dropArray);
        let array = [];
        selfDropArray.forEach(drop => {
            dropArray.forEach(location => {
                if(drop.location === location.fullName) {
                    this.elementArray.push(location.associateItem(this, drop))
                    array.push(location);
                }
            });
        });
        return array;
    }

    update(itemName, itemStatus) {
        let selectedFlag = false;
        this.contents.forEach(item => {
            if(item.name === itemName) {
                item.selected = itemStatus;
            }

            if(item.selected) selectedFlag = true
        });

        if(!this.selected && selectedFlag) {
            this.element.classList.add('selected');
            this.selected = true;
        }
        else if(this.selected && !selectedFlag) {
            this.element.classList.remove('selected');
            this.selected = false;
        }

        if(!this.vaulted) this.drops.forEach((location, index) => {
            location.update(new RegExp(`\\b${this.fullName}\\b`, 'i'), this.elementArray[index], this.selected);
        });
    }
}

class DropLocation {
    constructor(dropObject, dropContainerElement, dropElementTemplate, dropItemTemplate, dropRotationTemplate) {
        this.system = dropObject.system;
        this.node = dropObject.node;
        this.fullName = `${this.system} - ${this.node}`;
        this.mode = dropObject.mode;
        this.selected = false;
        this.items = dropObject.rewards;

        this.element = dropContainerElement.appendChild(dropElementTemplate.cloneNode(true));
        this.itemTemplate = dropItemTemplate;
        this.element.querySelector('.dropTitle').innerText = this.fullName;
        this.itemHolder = this.buidItemHolder(dropRotationTemplate);
    }

    associateItem(itemObject, dropObject) {
        if(Array.isArray(this.items)) {
            let element = this.itemHolder.appendChild(this.itemTemplate.cloneNode(true));
            element.querySelector('.itemName').innerText = itemObject.fullName;
            element.querySelector('.itemProbability').innerText = `${Math.round(dropObject.chance * 100)}%`;
            return element;
        }
        else {
            let element = this.itemHolder[dropObject.rotation].querySelector('.itemList').appendChild(this.itemTemplate.cloneNode(true));
            element.querySelector('.itemName').innerText = itemObject.fullName;
            element.querySelector('.itemProbability').innerText = `${Math.round(dropObject.chance * 100)}%`;
            return element;
        }
    }

    buidItemHolder(dropRotationTemplate) {
        if(Array.isArray(this.items)) {
            return this.element.querySelector('.itemList');
        }
        else {
            let elementObject = {};
            Object.keys(this.items).forEach(rotation => {
                let element = this.element.querySelector('.itemList').appendChild(dropRotationTemplate.cloneNode(true));
                element.setAttribute('rotation', rotation);
                element.querySelector('.rotationName').innerText = `Rotation ${rotation}`;
                elementObject[rotation] = element;
            });
            return elementObject;
        }
    }

    update(dropName, dropElement, dropSelected) {
        if(Array.isArray(this.items)) {
            let flag = false;
            this.items.forEach(item => {
                console.log(item)
                if(dropName.test(item.itemName)) item.selected = dropSelected;

                if(item.selected) flag = true; 
            });

            console.log(flag);

            if(!this.selected && flag) this.element.classList.add('selected');
            else if(this.selected && !flag) this.element.classList.remove('selected');
        }
        else {
            let rotationFlag = false;
            Object.keys(this.items).forEach(rotation => {
                let flag = false;
                this.items[rotation].forEach(item => {
                    if(dropName.test(item.itemName)) item.selected = dropSelected;

                    if(item.selected) flag = true; 
                });

                if(flag) {
                    this.itemHolder[rotation].classList.add('selected');
                    rotationFlag = true;
                }
                else this.itemHolder[rotation].classList.remove('selected');
            });

            console.log({rotationFlag});
            
            if(!this.selected && rotationFlag) this.element.classList.add('selected');
            else if(this.selected && !rotationFlag) this.element.classList.remove('selected');
        }

        if(dropSelected) dropElement.classList.add('selected')
        else dropElement.classList.remove('selected')
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

document.addEventListener('scroll', (e) => {
    if(window.scrollY > 0) {
        document.querySelector('header').classList.add('shadow');
    }
    else document.querySelector('header').classList.remove('shadow');
});

const itemSelect = document.querySelector('#itemHolder');
const itemSelectionTemplate = document.querySelector('#itemSelectionTemplate');
const itemWrapperTemplate = document.querySelector('#itemWrapperTemplate');
const RELIC_HOLDER = document.querySelector('#relicHolder');
const relicDisplayTemplate = document.querySelector('#relicWrapperTemplate');
const relicItemTemplate = document.querySelector('#relicItemTemplate');
const DROP_HOLDER = document.querySelector('#dropHolder');
const DROP_DISPLAY_TEMPLATE = document.querySelector('#dropDisplayTemplate').content.firstElementChild;
const DROP_ROTATION_TEMPLATE = document.querySelector('#dropRotationTemplate').content.firstElementChild;
const DROP_ITEM_TEMPLATE = document.querySelector('#dropItemTemplate').content.firstElementChild;
let itemselectors = [];
let relics = [];
let dropLocations = [];

fetch('/api/all/').then(response => response.json())
.then(json => {
    console.log(json);
    buildDrops(json.drops, dropLocations, DROP_HOLDER, DROP_DISPLAY_TEMPLATE, DROP_ITEM_TEMPLATE, DROP_ROTATION_TEMPLATE);
    buildRelics(json.relics.available, relics);
    buildRelics(json.relics.vaulted, relics);
    bulidItemSelectors(json.warframes);
    bulidItemSelectors(json.primary);
    bulidItemSelectors(json.secondary);
    bulidItemSelectors(json.melee);
});

const ITEM_SEARCH = document.querySelector('#itemSearch');
const EXPAND_FILTERS_BUTTON = document.querySelector('#expandFiltersButton');
const ITEM_TYPE_FILTERS = document.querySelector('#itemTypeFilters');

ITEM_SEARCH.addEventListener('input', (e) => {
    itemselectors.forEach(itemSelector => {
        itemSelector.filter(ITEM_SEARCH.value); 
    })
})

EXPAND_FILTERS_BUTTON.addEventListener('click', () => {
    ITEM_TYPE_FILTERS.classList.toggle('show');

    let toggleText = EXPAND_FILTERS_BUTTON.innerText;
    EXPAND_FILTERS_BUTTON.innerText = EXPAND_FILTERS_BUTTON.getAttribute('toggle-text');
    EXPAND_FILTERS_BUTTON.setAttribute('toggle-text', toggleText);
});

for(let i = 0; i < ITEM_TYPE_FILTERS.children.length; i++) {
    ITEM_TYPE_FILTERS.children[i].querySelector('input').addEventListener('click', (e) => {
        itemselectors.forEach(itemSelector => {
            itemSelector.filterType(e.target.name, !(e.target.checked));
        })
    })
}

function bulidItemSelectors(array) {
    array.forEach(item => {
        itemselectors.push(new ItemSelector(item));
    })
}

function buildRelics(relicArray, outputArray) {
    relicArray.forEach(relic => {
        outputArray.push(new Relic(relic, relicDisplayTemplate.content.firstElementChild, relicItemTemplate.content.firstElementChild, RELIC_HOLDER, dropLocations));
    });
}

function buildDrops(dropArray, outputArray, outputElement, dropDisplayTemplate, dropItemTemplate, dropRotationTemplate) {
    dropArray.forEach(drop => {
        outputArray.push(new DropLocation(drop, outputElement, dropDisplayTemplate, dropItemTemplate, dropRotationTemplate));
    });
}