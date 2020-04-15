const express = require('express');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

let warfameData;
let meleeWeaponData;
let primaryWeaponData;
let secondaryWeaponData;

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json')
.then(response => {
    warfameData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Primary.json')
.then(response => {
    primaryWeaponData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Secondary.json')
.then(response => {
    secondaryWeaponData = filterPrimes(response.data);
});

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Melee.json')
.then(response => {
    meleeWeaponData = filterPrimes(response.data);
})

app.use(express.static(`${__dirname}/static`));

app.get('/api/warframes', (req, res) => {
    res.send(warfameData);
});

app.listen(port);
console.log(`listening on port ${port}`);

function filterPrimes(array) {
    return array.filter(item => {
        if(item.hasOwnProperty('vaulted')) return true
        else return false
    });
}