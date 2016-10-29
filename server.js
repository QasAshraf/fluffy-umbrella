var express = require('express');
var app = express();

app.use(express.static('static'));
app.use(express.static('bower_components/phaser/build'));

app.listen(8080, function () {
    console.log('Game server listening on port 8080!');
});