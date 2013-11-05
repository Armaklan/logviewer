/**
 * Created by bennekroufm on 19/10/13.
 */
var express = require('express')
    , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var logfiles = []
logfiles[0] = {
	name: "fluxpousse",
	url : "c:\\developpement\\test.log"
};
logfiles[1] = {
	name: "fluxpousse",
	url : "c:\\developpement\\err.log"
};

Tail = require('tail').Tail;

var tail = []
tail[0] = new Tail(logfiles[0].url);
tail[1] = new Tail(logfiles[1].url);

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false }));
});

var fs = require('fs'); // file system module

server.listen(7000);

io.of('/1').on('connection', function(client){

	fs.readFile(logfiles[0].url, 'utf-8', function(err, data) {
	    if (err) throw err;

	    var lines = data.trim().split('\n');
	    var lastLines = lines.slice(-100);

	    lastLines.forEach( function(line) {
	    	client.emit('Log', line);
	    });
	});


    tail[0].on("line", function(data) {
        client.emit('Log', data);
    });

});

io.of('/2').on('connection', function(client){

	fs.readFile(logfiles[1].url, 'utf-8', function(err, data) {
	    if (err) throw err;

	    var lines = data.trim().split('\n');
	    var lastLines = lines.slice(-100);

	    lastLines.forEach( function(line) {
	    	client.emit('Log', line);
	    });
	});


    tail[1].on("line", function(data) {
        client.emit('Log', data);
    });

});
