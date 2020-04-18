const express = require('express');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

let apiData = {

};
let dataFlag = false;

axios.all([axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Primary.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Secondary.json'),
    axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Melee.json')])
.then(axios.spread((warframes, primaries, secondaries, melee) => {
    apiData.warframes = filterPrimes(warframes.data);
    apiData.primary = filterPrimes(primaries.data);
    apiData.secondary = filterPrimes(secondaries.data);
    apiData.melee = filterPrimes(melee.data);
}))
.then(() => {
    dataFlag = true;
});

app.use(express.static(`${__dirname}/static`));

app.get('/api/warframes', (req, res) => {
    if(dataFlag) res.send(apiData.warframes)
    else res.sendStatus(404);
});

app.get('/api/primary', (req, res) => {
    if(dataFlag) res.send(apiData.primary)
    else res.sendStatus(404);
});

app.get('/api/secondary', (req, res) => {
    if(dataFlag) res.send(apiData.secondary)
    else res.sendStatus(404);
});

app.get('/api/melee', (req, res) => {
    if(dataFlag) res.send(apiData.melee)
    else res.sendStatus(404);
});

app.get('/api/all', (req, res) => {
    if(dataFlag) res.send(apiData)
    else res.sendStatus(404);
})

app.listen(port);
console.log(`listening on port ${port}`);

function filterPrimes(array) {
    let regex = /(?<!excalibur) prime/i;
    return array.filter(item => {
        return (regex.test(item.name) && item.hasOwnProperty('components'));
    });
}