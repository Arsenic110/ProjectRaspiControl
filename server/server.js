//http is the library for hosting a website
const http = require('http');

//get a bunch of middleware and libraries
const express = require('express');
const fs = require("fs").promises;
const socketio = require("socket.io");
const app = express();

//pigpio is the library for controlling the GPIO pins on the raspberry pi
const hardware = require('./hardware.js');
var x = 0;

//set up server and sockets
const server = http.createServer(app);
const io = socketio(server);

//for reading config file
const config = require('../config.json');

init();

function init()
{
    //register the request handler
    app.use(requestListener);

    //register sockets function which handles and delegates server <-> client communication
    io.on("connection", sockets);

    //start the server!
    server.listen(config.port, config.hostname, () => 
    {
        console.log(`Server running at http://${config.hostname}:${config.port}/`);
    });

    setInterval(update, 20);
}

function update()
{
    hardware.update();
}

function requestListener(request, response)
{
    //this is the request listener function. This is the code that runs when someone tries to access something on our website
    
    //the first thing we must do is ensure that we are only ever serving files from inside the '/public/' directory. this is because we dont want someone to access the server sensitive stuff. it would be a security gap

    var url = request.url;

    if (request.url == "/")
        url = "/index.html";


    fs.readFile(__dirname + "/../public" + url).then((contents) =>
    {
        //in an ideal world, we would declare a header for each content type. 
        //but this is not an ideal world.

        //200 response code: all good
        response.writeHead(200);

        //stick the contents of the file to the reponse
        response.write(contents);

        //end 
        response.end();

    }).catch(err => 
        {//neat and cozy error catcher.
            if (err.errno == -2)
            {//file does not exist
                response.writeHead(404);
                response.write("404 File Not Found");
                response.end();
            }
            else
            {
                response.writeHead(500);
                response.write("500 Internal Server Error");
                response.end();
            }
            console.log(err);
        });
}

function sockets(socket)
{
    console.log(`SocketIO: New Connection: ${socket.id}`);

    socket.on("init", (data) =>
    {
        console.log("SocketIO: Init! " + data);
    });

    socket.on("write", () => 
    {
        hardware.pulse("LED", config.LEDTimeout);
        if(x < 245)
            x += 10;
        hardware.setPWM("Thermostat", x);
    });

    socket.on("reset", () =>
    {
        hardware.setPWM("LED", 0);
        hardware.setPWM("Thermostat", 0);
    });
}

