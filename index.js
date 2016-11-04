var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var qr = require ('qr-image');
var fp = require ('fingerprintjs2');
var bodyParser = require('body-parser');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//httpServer.listen(8080);
httpsServer.listen(8443);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

app.get(/^(.+)$/, function(req,res,next){
	switch(req.params[0]){
		case '/registro':
			var code = qr.image("https://10.105.231.63:8443/registroRemoto", { type: 'svg' });
		        res.type('svg');
        		code.pipe(res);
			break;
		case '/registroRemoto':
			res.sendFile(__dirname + '/registroRemoto.html');
			break;
		case '/guardarRegistro':
		default:
			res.sendFile(__dirname + req.params[0]);		
			break;
	}
});

app.post(/^(.+)$/, function(req,res,next){
	switch(req.params[0]){
		case '/guardarRegistro':
			console.log(req.body.id);
			break;	
		default:
			break;
	}
});
