console.log("Bruh!");

var socket = io();

socket.emit("init", "Hewoooo!!");

function button()
{
    socket.emit("write");
}