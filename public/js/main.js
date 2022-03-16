console.log("Bruh!");

var socket = io();

socket.emit("init", "Hewoooo!!");

$('#slider').on("change", () =>
{
    $('#thermo-value')[0].innerHTML = "Value: " +  $("#slider").val();
    socket.emit('thermostat', $("#slider").val(), 5);

});

console.log($('#thermo-value')[0]);

//window.setInterval(update, 20);

function update()
{
    $('#thermo-value')[0].innerHTML = $("#slider").val();
}