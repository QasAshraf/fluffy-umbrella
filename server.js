var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('bower_components/phaser/build'));
app.use(express.static('node_modules/socket.io-client'));

app.use(express.static('client'));

app.use('/controller', express.static('controller'));


http.listen(8080, function () {
    console.log('Game server listening on port 8080!');
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('controllerData', function(data){
        console.log('controllerData: ' + JSON.stringify(data, null, 4));

        //Lets forward on this data to the client game view
        this.emit('serverUserData', data);
    });
});
