//TODO: create own web scraper to fetch prime drop data due to certain missing or poorly formatted items in APIs
const dataFunctions = require('./apiDataFunctions');
const express = require('express');
const morgan = require('morgan');
const eventEmitter = require('events');
const app = express();
const port = process.env.PORT || 3000;

const dataCheck = new eventEmitter();
let apiData = {

};
let dataFlag = false
dataFunctions.open('./apiData.json').then(apiDataObject => {
    if(Date.now() - apiDataObject.fetchTime < 43200000) {
        apiData = apiDataObject;
        dataCheck.emit('dataLoaded');
        dataFlag = true;
        setTimeout(updateDataAtInterval, 43200000 - (Date.now() - apiData.fetchTime));
    }
    else {
        dataFunctions.updateData('./apiData.json').then(apiDataObject => {
            apiData = apiDataObject;
            dataCheck.emit('dataLoaded');
            dataFlag = true;
            setTimeout(updateDataAtInterval, 43200000);
        })
    }
});

app.use(morgan('short'));
app.use(express.static(`${__dirname}/static`));
app.use('/api', (req, res, next) => {
    if(dataFlag) next();
    else {
        dataCheck.addEventListener('dataLoaded', () => {
            next();
        }, {once: true});
    }
})

app.get('/api/:category', (req, res) => {
    if(req.params.category === 'all') res.send(apiData);
    else if(apiData.hasOwnProperty(req.params.category)) res.send(apiData[req.params.category])
    else res.status(404).send('No such category exists');
})

app.listen(port);
console.log(`listening on port ${port}`);

function updateDataAtInterval() {
    dataFunctions.update('./apiData.json').then(apiDataObject => {
        apiData = apiDataObject;
        setTimeout(updateDataAtInterval, 43200000);
    })
}