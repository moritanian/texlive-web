const express = require('express');
const httpProxy = require('http-proxy');

const app = express();

app.use('/static', express.static(__dirname + '/../static/'));

var proxy = httpProxy.createProxyServer({});
proxy.on('error', function(err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something wrong.')
});

app.get('*', function(req, res) {
  proxy.web(req, res, {
    target: 'http://localhost:8080/',
    secure: false
  });
});

app.listen(8000);

