var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('bower_components/phaser/build'));
app.use(express.static('bower_components/foundation-sites/dist'));
app.use(express.static('bower_components/nosleep'));
app.use(express.static('node_modules/socket.io-client'));

app.use(express.static('client'));

app.use('/play', express.static('controller'));


http.listen(8080, function () {
    console.log('Game server listening on port 8080!');
});

io.on('connection', function(socket){
    console.log('user' + socket.id + ' connected');
    socket.on('disconnect', function(){
        console.log('user ' + this.id + ' disconnected');
        io.emit('serverUserDisconnect', this.id);
    });

    socket.on('controllerData', function(data){
        //console.log('controllerData: ' + JSON.stringify(data, null, 4));

        //Lets forward on this data to the client game view
        if(data)
        {
            io.emit('serverUserData', data);
        }
    });

    socket.on('playerTriedToRestart', function (data) {
        io.emit('restartPlayer', data.id)
    })

    socket.on('clientRestart', function (data) {
        var client = io.clients()

        if (client) {
            client.emit('controllerRestart', 'piss off')
        }

    })
});
