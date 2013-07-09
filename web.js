var fs = require('fs');

var express = require('express');

var app = express.createServer(express.logger());

var encoding = 'utf8';

function readFile(file)
{
    return fs.readFileSync(file).toString(encoding);
}

app.get('/', function(request, response) {
    response.send(readFile('index.html'));
});

/*
app.get('/', function(request, response) {
  response.send('Hello World 2!');
});
*/

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
