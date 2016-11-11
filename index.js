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
var websocket = require('ws').Server;

var usuarioLogueado = '';
var HOSTIP = process.env.HOSTIP;
// your express configuration here

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//httpServer.listen(8080);
httpsServer.listen(8443);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

var wss = new websocket ( { 
	server: httpsServer, 
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

wss.on('connection', function (wss){
	//enviar algo
	wss.send('prueba');

});

function usuLogueado(){
	wss.clients.forEach(function each(client){
	client.send("usuario logueado");
	});
}

app.get(/^(.+)$/, function(req,res,next){
	switch(req.params[0]){
		case '/registro':
			var code = qr.image("https://"+ HOSTIP + ":8443/registroRemoto", { type: 'svg' });
		        res.type('svg');
        		code.pipe(res);
			break;
		case '/registroRemoto':
			res.sendFile(__dirname + '/registroRemoto.html');
			break;
		case '/login':
			var code = qr.image("https://"+ HOSTIP +":8443/loginRemoto", {type:'svg'});
			res.type('svg');
			code.pipe(res);
			break;
		case '/loginRemoto':
			res.sendFile(__dirname + '/loginRemoto.html');
			break;
		default:
			res.sendFile(__dirname + req.params[0]);		
			break;
	}
});

app.post(/^(.+)$/, function(req,res,next){
	switch(req.params[0]){
		case '/guardarRegistro':
			usuarioLogueado = req.body.id;
			console.log(req.body.id);
			break;	
		case '/iniciarSesion':
			var id = req.body.id;
			if(usuarioLogueado == id){
			//enviar notificación al browser para que vea que el usuario se logueo
			usuLogueado();
			}	
		default:
			break;
	}
});
