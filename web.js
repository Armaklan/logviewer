var http = require('http');


http.createServer(function(){

	console.log('Le process r�pond bien !!');


}).listen(process.argv[2]);
