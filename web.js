var http = require('http');


http.createServer(function(){

	console.log('Le process répond bien !!');


}).listen(process.argv[2]);
