var http = require("http");
var url = require("url");
var Vortex = require('vortexjs');
var express = require('express');

var NodoServerHTTP = Vortex.NodoServerHTTP;
var Vx = Vortex.Vx;

var pad = function (n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var sesiones_http = [];
var ultimo_id_sesion_http = 0;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

var app = express();
var server = http.createServer(app);

app.use(allowCrossDomain);

//TODO: Hacer que el NodoServerHTTP sea el que administra los requests y tenga un router 
//interno conectado al router principal, a ese router se conectan los NodoSesionHTTP (actual NodoServerHTTP)
app.post('/create', function(request, response){
    var conector_http = new NodoServerHTTP({
        id: pad(ultimo_id_sesion_http, 4),
        //verbose:true,
        app: app,
        alDesconectar: function(){
            sesiones_http.splice(sesiones_http.indexOf(conector_http), 1);
        }
    });
    ultimo_id_sesion_http+=1;
    sesiones_http.push(conector_http);
    Vx.conectarCon(conector_http);     
    response.send(conector_http.idSesion);
});

//TODO: Hacer que el NodoServerSocket sea el que administra las conexiones y tenga un router 
//interno conectado al router principal, a ese router se conectan los NodoSesionSocket, habría que diferenciar los canales con ids, como los http.

var server_web_sockets = new Vortex.ServerWebSockets(server);

app.get('/infoSesiones', function(request, response){
    var info_sesiones = {
        http: sesiones_http.length,
        webSocket: sesiones_web_socket.length,
        router: router._patas.length
    };
    response.send(JSON.stringify(info_sesiones));
});

var puerto = process.env.PORT || 3000;
server.listen(puerto);


console.log('Arrancó la cosa en ' + puerto);