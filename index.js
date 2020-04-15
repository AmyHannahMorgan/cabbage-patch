const express = require('express');
const axios = require('axios').default;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/static`));

app.listen(port);
console.log(`listening on port ${port}`);