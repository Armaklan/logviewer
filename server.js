/**
 * Created by bennekroufm on 19/10/13.
 */
var express = require('express')
    , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


Tail = require('tail').Tail;

tail = new Tail("/usr/local/jboss-5.1.0.GA/server/fluxpousse/log/server.log");

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false }));
});

server.listen(7000);

io.sockets.on('connection', function(client){

    tail.on("line", function(data) {
        client.emit('Log', data);
    });

});

