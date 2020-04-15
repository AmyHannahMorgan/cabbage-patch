const express = require('express');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

let warfameData;

axios.get('https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json')
.then(response => {
    warfameData = response.data.filter(warframe => {
        if(warframe.hasOwnProperty('vaulted')){
            return true
        }
        else return false;
    });
});

app.use(express.static(`${__dirname}/static`));

app.listen(port);
console.log(`listening on port ${port}`);