console.log("Bruh!");

var socket = {emit(){}};
socket = io();

var lights = 0;

init();

function init()
{
    socket.emit('init', "Hewoooo!!");

    socket.on('hardware-list', generateHardware);

    $('#slider').on("change", () =>
    {
        $('#thermo-value')[0].innerHTML = "Value: " +  $("#slider").val();
        socket.emit('thermostat', $("#slider").val(), 5);
    
    });
}

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

function generateHardware(hw)
{
    console.log("Generating Hardware List...");
    for(let i = 0; i < hw.length; i++)
    {
        let el = document.createElement('div');
        el.classList.add('blockquote');

        let hdg = document.createElement('h3');
        hdg.innerHTML = hw[i].name;
        el.appendChild(hdg);

        let btn = document.createElement('button');
        btn.innerHTML = "Toggle On/Off";
        btn.onclick = function() { socket.emit('toggle', hw[i].name) };
        let p = document.createElement('p');
        p.appendChild(btn)
        el.appendChild(p);


        document.getElementById('container-parent').appendChild(el);
        document.getElementById('container-parent').appendChild(document.createElement('br'));
    }
    console.log("Hardware List Complete!");

}