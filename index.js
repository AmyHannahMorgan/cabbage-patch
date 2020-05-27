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
        obj.components = reduceComponents(filterComponents(item.components));
        obj.imageName = item.imageName;
        obj.vaulted = item.hasOwnProperty('vaulted') ? item.vaulted : false;

        newArray.push(obj);
    });

    return newArray;
}

function filterComponents(componentsArray) {
    let regex = /blueprint|chassis|neuroptics|systems|barrel|stock|receiver|grip|string|lower limb|upper limb|link| prime|blade|gauntlet|handle|ornament|chain|pouch|stars/i;
    return componentsArray.filter(component => {
        return regex.test(component.name);
    })
}

function reduceComponents(componentsArray) {
    let newArray = [];
    componentsArray.forEach(component => {
        let obj = {};
        obj.name = component.name;
        obj.ducats = component.ducats;
        obj.drops = consolidateDrops(component.drops);

        newArray.push(obj);
    });
    return newArray;
}

function consolidateDrops(dropsArray) {
    function generateRegexsRelics(relicArray, position) {
        function checkDuplicate(array, test) {
            let flag = false;
            array.forEach(item => {
                if(item === test) flag = true;
            });
            return flag;
        }

        let regexs = [];
        let checks = [];
        
        relicArray.forEach(relic => {
            let regexString = relic.location.split(' ')[position];

            if(!checkDuplicate(checks, regexString)) {
                regexs.push(new RegExp(`\\b${regexString}\\b`, 'i'));
                checks.push(regexString);
            };
        });

        return regexs
    }

    let erasRegexs = generateRegexsRelics(dropsArray, 0);
    let eras = [];
    erasRegexs.forEach(regex => {
        eras.push(dropsArray.filter(relic => {
            return regex.test(relic.location);
        }));
    });

    let nameRegexs = [];
    eras.forEach(era => {
        nameRegexs.push(generateRegexsRelics(era, 1));
    });

    eras = eras.map(era => {
        let newArray = []
        nameRegexs.forEach(name => {
            newArray.push(era.filter(relic => {
                return name.test(relic.location);
            }));
        });
        return newArray.map(relics => {
            return relics.reduce((obj, relic, index) => {
                let name = relic.location.split(' ');

                if(index === 0) {
                    obj.era = name[0];
                    obj.name = name[1];
                }

                obj[name[3].toLowerCase()] = relic.chance;

                return obj;
            }, {});
        })
    });

    return eras.reduce((acc, obj) => {
        return acc.concat(obj);
    }, []);
}