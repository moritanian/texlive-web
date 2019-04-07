const express = require('express');
const app = express();
const root = './../dist';
const port = 8000;
app.use("/", express.static('./dist'));

app.get('/', function(req, res) {
    res.sendFile( root + '/index.html', { root: __dirname });
});

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
});
