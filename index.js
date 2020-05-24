const express = require('express');
const eventEmitter = require('events');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

const dataCheck = new eventEmitter();
let apiData = {

};
let dataFlag = false

axios.all([axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Primary.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Secondary.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Melee.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Relics.json')])
.then(axios.spread((warframes, primaries, secondaries, melee, relics) => {
    apiData.warframes = reduceItems(filterPrimes(warframes.data));
    apiData.primary = reduceItems(filterPrimes(primaries.data));
    apiData.secondary = reduceItems(filterPrimes(secondaries.data));
    apiData.melee = reduceItems(filterPrimes(melee.data));
    apiData.relics = splitRelics(filterRelics(relics.data));
}))
.then(() => {
    dataCheck.emit('dataLoaded');
    dataFlag = true;
});

app.use(express.static(`${__dirname}/static`));

app.get('/api/warframes', (req, res) => {
    if(dataFlag) res.send(apiData.warframes)
    else {
        dataCheck.addListener('dataLoaded', () => {
            res.send(apiData.warframes)
        })
    }
});

app.get('/api/primary', (req, res) => {
    if(dataFlag) res.send(apiData.primary)
    else {
        dataCheck.addListener('dataLoaded', () => {
            res.send(apiData.primary)
        })
    }
});

app.get('/api/secondary', (req, res) => {
    if(dataFlag) res.send(apiData.secondary)
    else {
        dataCheck.addListener('dataLoaded', () => {
            res.send(apiData.secondary)
        })
    }
});

app.get('/api/melee', (req, res) => {
    if(dataFlag) res.send(apiData.melee)
    else {
        dataCheck.addListener('dataLoaded', () => {
            res.send(apiData.melee)
        })
    }
});

app.get('/api/all', (req, res) => {
    if(dataFlag) res.send(apiData)
    else {
        dataCheck.addListener('dataLoaded', () => {
            res.send(apiData)
        })
    }
})

app.listen(port);
console.log(`listening on port ${port}`);

function filterPrimes(array) {
    let regex = /(?<!excalibur) prime/i;
    return array.filter(item => {
        return (regex.test(item.name) && item.hasOwnProperty('components'));
    });
}

function filterRelics(array) {
    let regex = / intact/i;
    return array.filter(relic => {
        return regex.test(relic.name);
    })
}

function splitRelics(array) {
    let obj = {
        available: [],
        vaulted: []
    };

    array.forEach(relic => {
        if(relic.hasOwnProperty('drops')) {
            obj.available.push(relic);
        }
        else obj.vaulted.push(relic);
    });

    return obj;
}

function reduceItems(itemArray) {
    let newArray =[]
    itemArray.forEach(item => {
        let obj = {};
        obj.name = item.name;
        obj.components = reduceComponents(item.components);
        obj.imageName = item.imageName;
        obj.vaulted = item.hasOwnProperty('vaulted') ? item.vaulted : false;

        newArray.push(obj);
    });

    return newArray;
}

function reduceComponents(componentsArray) {
    let regex = /blueprint|chassis|neuroptics|systems|barrel|stock|receiver|grip|string|lower limb|upper limb|link| prime|blade|gauntlet|handle|ornament|chain|pouch|stars/i;
    return componentsArray.filter(component => {
        return regex.test(component.name);
    })
}