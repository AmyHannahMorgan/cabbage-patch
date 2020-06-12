const fs = require('fs').promises;
const express = require('express');
const eventEmitter = require('events');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

const dataCheck = new eventEmitter();
let apiData = {

};
let dataFlag = false
let dataBuildStartTime = Date.now();
fs.open('./apiData.json', 'r+').then(file => {
    file.readFile({ encoding: 'utf8' }).then(fileString => {
        apiData = JSON.parse(fileString);
        file.close().then(() => {
            if(Date.now() - apiData.fetchTime >= 43200000) {
                updateData();
            }
            else {
                dataCheck.emit('dataLoaded');
                dataFlag = true;
                let dataBuildEndTime = Date.now()
                console.log(`loading api data from file took ${dataBuildEndTime - dataBuildStartTime}ms`);
                setTimeout(updateData, 43200000 - (Date.now() - apiData.fetchTime));
            }
        })
    })
})
.catch(err => {
    console.log('no apiData file found, creating it');
    fs.open('./apiData.json', 'w+').then(file => {
        console.log('file created, fetching API data from sources')
        getApiData().then(apiDataObject => {
            console.log('API data retrieved and processed, making it available to clients')
            apiData = apiDataObject;
            console.log('writing API data to file');
            file.writeFile(JSON.stringify(apiData, {encoding:'utf8'})).then(() => {
                file.close();
            })
            .then(() => {
                dataCheck.emit('dataLoaded');
                dataFlag = true;
                let dataBuildEndTime = Date.now()
                console.log(`api data build, from first request to finished data object, took ${dataBuildEndTime - dataBuildStartTime}ms`);
                setTimeout(updateData, 43200000);
            });
        })
    })
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

function getApiData() {
    return new Promise((res, rej) => {
        let obj = {}
        axios.all([axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Primary.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Secondary.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Melee.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Sentinels.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Relics.json'),
            axios.get('https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/missionRewards.json')])
        .then(axios.spread((warframes, primaries, secondaries, melee, sentinels, relics, missionRewards) => {
            console.log(`Loading all api dependanceies took ${Date.now() - dataBuildStartTime}ms`);
            obj.warframes = reduceItems(filterPrimes(warframes.data));
            obj.primary = reduceItems(filterPrimes(primaries.data));
            obj.secondary = reduceItems(filterPrimes(secondaries.data));
            obj.melee = reduceItems(filterPrimes(melee.data));
            obj.sentinels = reduceItems(filterPrimes(sentinels.data));
            obj.relics = splitRelics(filterRelics(relics.data));
            obj.drops = reduceRewards(missionRewards.data.missionRewards);
            obj.fetchTime = Date.now();
            res(obj);
        }))
        .catch(err => rej(err));
    })
}

function updateData() {
    fs.open('./apiData.json', 'w+')
    .then(file => {
        getApiData()
        .then(apiDataObject => {
            apiData = apiDataObject;
            file.writeFile(JSON.stringify(apiDataObject))
            .then(() => {
                file.close()
                setTimeout(updateData, 43200000);
            })
        })
    })
}

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

    for(let i = 0; i < array.length; i++) {
        if(array[i].hasOwnProperty('drops')) {
            obj.available.push(array[i]);
        }
        else obj.vaulted.push(array[i]);
    }

    // array.forEach(relic => {
    //     if(relic.hasOwnProperty('drops')) {
    //         obj.available.push(relic);
    //     }
    //     else obj.vaulted.push(relic);
    // });

    return obj;
}

function reduceItems(itemArray) {
    let newArray =[]
    for(let i = 0; i < itemArray.length; i++) {
        let item = itemArray[i];
        let obj = {};
        obj.name = item.name;
        obj.components = reduceComponents(filterComponents(item.components));
        obj.imageName = item.imageName;
        obj.vaulted = item.hasOwnProperty('vaulted') ? item.vaulted : false;
        obj.type = item.category.toLowerCase();

        newArray.push(obj);
    }
    // itemArray.forEach(item => {
    //     let obj = {};
    //     obj.name = item.name;
    //     obj.components = reduceComponents(filterComponents(item.components));
    //     obj.imageName = item.imageName;
    //     obj.vaulted = item.hasOwnProperty('vaulted') ? item.vaulted : false;
    //     obj.type = item.category.toLowerCase();

    //     newArray.push(obj);
    // });

    return newArray;
}

function filterComponents(componentsArray) {
    let regex = /blueprint|chassis|neuroptics|systems|barrel|stock|receiver|grip|string|lower limb|upper limb|link|blade|gauntlet|handle|ornament|chain|pouch|stars|carapace|cerebrum/i;
    return componentsArray.filter(component => {
        return regex.test(component.name);
    })
}

function reduceComponents(componentsArray) {
    let newArray = [];
    for(let i = 0; i < componentsArray.length; i++) {
        let obj = {};
        let component = componentsArray[i];
        obj.name = component.name;
        obj.ducats = component.ducats;
        obj.drops = consolidateDrops(component.drops);

        newArray.push(obj);
    }
    // componentsArray.forEach(component => {
    //     let obj = {};
    //     obj.name = component.name;
    //     obj.ducats = component.ducats;
    //     obj.drops = consolidateDrops(component.drops);

    //     newArray.push(obj);
    // });
    return newArray;
}

function reduceRewards(rewardsObject) {
    let returnArray = [];
    for(let x = 0; x < Object.keys(rewardsObject).length; x++) {
        let system = Object.keys(rewardsObject)[x];
        for(let y = 0; y < Object.keys(rewardsObject[system]).length; y++) {
            let node = Object.keys(rewardsObject[system])[y];
            if(!rewardsObject[system][node].isEvent) {
                let obj = {
                    system: system,
                    node: node,
                    mode: rewardsObject[system][node].gameMode,
                    rewards: filterRewards(rewardsObject[system][node].rewards)
                }
                returnArray.push(obj);
            }
        }
    }
    // Object.keys(rewardsObject).forEach(system => {
    //     Object.keys(rewardsObject[system]).forEach(node => {
    //         if(!rewardsObject[system][node].isEvent) {
    //             let obj = {
    //                 system: system,
    //                 node: node,
    //                 mode: rewardsObject[system][node].gameMode,
    //                 rewards: filterRewards(rewardsObject[system][node].rewards)
    //             }
    //             returnArray.push(obj);
    //         }
    //     })
    // })
    return returnArray;
}

function filterRewards(rewardParam) {
    if(Array.isArray(rewardParam)) {
        return rewardParam.filter(reward => {
            let regex = /\brelic\b/i;
            return regex.test(reward.itemName);
        })
    }
    else {
        let returnObject = {};
        for(let i = 0; i < Object.keys(rewardParam).length; i++) {
            let rotation = Object.keys(rewardParam)[i];
            returnObject[rotation] = rewardParam[rotation].filter(reward => {
                let regex = /\brelic\b/i;
                return regex.test(reward.itemName);
            })
        }
        // Object.keys(rewardParam).forEach(rotation => {
        //     returnObject[rotation] = rewardParam[rotation].filter(reward => {
        //         let regex = /\brelic\b/i;
        //         return regex.test(reward.itemName);
        //     })
        // });
        return returnObject;
    }
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

    eras = eras.map((era, index) => {
        let newArray = []
        nameRegexs[index].forEach(name => {
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

                obj[name[2].toLowerCase()] = relic.chance;

                return obj;
            }, {});
        })
    });

    return eras.reduce((acc, obj) => {
        return acc.concat(obj);
    }, []);
}