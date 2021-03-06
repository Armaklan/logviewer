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
var highlight = logModule.highlight;

Tail = require('tail').Tail;

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false }));
});

server.listen(7000);

app.get('/logs.json', function(req, res){
  res.send(logfiles);
});

function getCss(line) {
	var css = ""
	highlight.forEach(function (elt){
		if ( (css == "") && (line.toLowerCase().indexOf(elt.text.toLowerCase()) != -1)) {
			css = "alert alert-" + elt.level;
		}
	});
	return css;
}


logfiles.forEach(function(log, index) {
	log.css = '';
	log.id = index;

	tail[log.id] = new Tail(log.url);

	tail[log.id].on('error', function(){
	    console.log("ERROR FATAL - File " + log.url + " not found ");
	    throw new Error("ERROR FATAL - File " + log.url + " not found ");
	});


	app.get('/file/' + log.id, function(req, res) {
		var stat = fs.statSync(log.url);
		res.writeHead(200, {
			  'Content-Type': 'application/octet-stream', 
		      'Content-Length': stat.size,
		      'Content-disposition' : 'attachment; filename="' + log.name + '.log"'
		});
		var stream = fs.createReadStream(log.url, { bufferSize: 64 * 1024 });
		stream.pipe(res);
	});

	io.of('/' + log.id).on('connection', function(client){

		client.on('init', function(data) {

			console.log('Initialization');
			
			fs.readFile(log.url, 'utf-8', function(err, data) {
			    if (err) throw err;

			    var lines = data.trim().split('\n');
			    var lastLines = lines.slice(-300);

			    lastLines.forEach( function(line) {
			    	var css = getCss(line);
			    	client.emit('Log', {
			    		'text': line,
			    		'css': css
			    	});
			    });
			});

		});

	    tail[log.id].on("line", function(data) {
	    	var css = getCss(line);
	    	client.emit('Log', {
	    		'text': line,
	    		'css': css
	    	});
	    });

	});

});