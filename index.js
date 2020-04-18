const express = require('express');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

let apiData = {

}

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json')
.then(response => {
    apiData.warfameData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Primary.json')
.then(response => {
    apiData.primaryWeaponData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Secondary.json')
.then(response => {
    apiData.secondaryWeaponData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Melee.json')
.then(response => {
    apiData.meleeWeaponData = filterPrimes(response.data);
})

app.use(express.static(`${__dirname}/static`));

app.get('/api/warframes', (req, res) => {
    res.send(apiData.warfameData);
});

app.get('/api/primary', (req, res) => {
    res.send(apiData.primaryWeaponData);
});

app.get('/api/secondary', (req, res) => {
    res.send(apiData.secondaryWeaponData);
});

app.get('/api/melee', (req, res) => {
    res.send(apiData.meleeWeaponData);
});

app.get('/api/all', (req, res) => {
    res.send(apiData);
})

app.listen(port);
console.log(`listening on port ${port}`);

function filterPrimes(array) {
    let regex = /(?<!excalibur) prime/i;
    return array.filter(item => {
        return (regex.test(item.name) && item.hasOwnProperty('components'));
    });
}