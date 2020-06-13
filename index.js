//TODO: create own web scraper to fetch prime drop data due to certain missing or poorly formatted items in APIs
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