var express = require('express');

var app = express();

app.get('/', function(req, res){

	res.send('Ca farte');

});

app.get('/users/:id', function(req, res){

	res.send('Ca farte Mr '+req.params.id);

});


app.listen(process.argv[2]);
