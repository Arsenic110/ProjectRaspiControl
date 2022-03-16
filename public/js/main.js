console.log("Bruh!");

var socket = {emit(){}};
socket = io();

var lights = 0;

socket.emit("init", "Hewoooo!!");

$('#slider').on("change", () =>
{
    $('#thermo-value')[0].innerHTML = "Value: " +  $("#slider").val();
    socket.emit('thermostat', $("#slider").val(), 5);

});

function toggleLights()
{
    if(lights == 0)
    {
        lights = 1;
        $('#lights-toggle')[0].innerHTML = "Turn Off";
        console.log("Turn Off");
    }
    else if (lights == 1)
    {
        lights = 0;
        $('#lights-toggle')[0].innerHTML = "Turn On";
        console.log("Turn On");
    }

    socket.emit('setstate', 'Lights', lights);
}

//window.setInterval(update, 20);

function update()
{
    
}