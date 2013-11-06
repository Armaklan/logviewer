/**
 * Configuration node.js pour exposer :
 * 	- La page Web et ses ressources
 *  - Le service WebSocket de suivi des logs
 * @author ZUBER Lionel <lionel.zuber@armaklan.org>
 * @version 0.1
 * @license MIT
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

		client.on('init', function(data) {

			console.log('Initialization');
			
			fs.readFile(log.url, 'utf-8', function(err, data) {
			    if (err) throw err;

			    var lines = data.trim().split('\n');
			    var lastLines = lines.slice(-300);

			    lastLines.forEach( function(line) {
			    	client.emit('Log', line);
			    });
			});
		});


	    tail[log.id].on("line", function(data) {
	        client.emit('Log', data);
	    });

	});

});