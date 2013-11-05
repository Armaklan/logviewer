/**
 * Created by bennekroufm on 19/10/13.
 */
var express = require('express')
    , http = require('http');
var fs = require('fs'); // file system module
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var tail = [];

var logModule = require('./conf.js');
var logfiles = logModule.logfiles;

Tail = require('tail').Tail;

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false }));
});

server.listen(7000);

app.get('/logs.json', function(req, res){
  res.send(logfiles);
});

logfiles.forEach(function(log) {
	tail[log.id] = new Tail(log.url);

	io.of('/' + log.id).on('connection', function(client){

		fs.readFile(log.url, 'utf-8', function(err, data) {
		    if (err) throw err;

		    var lines = data.trim().split('\n');
		    var lastLines = lines.slice(-100);

		    lastLines.forEach( function(line) {
		    	client.emit('Log', line);
		    });
		});


	    tail[log.id].on("line", function(data) {
	        client.emit('Log', data);
	    });

	});

});