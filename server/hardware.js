
const config = require('../config.json');
const Gpio = require("pigpio").Gpio;

class Device
{//small, internal wrapper class for GPIO devices
    constructor(name, pin, mode)
    {
        this.name = name;
        this.pin = pin;
        if(mode == "output")
            this.mode = Gpio.OUTPUT;
        if(mode == "input")
            this.mode = Gpio.INPUT;
        
        this.dev = new Gpio(pin, {mode: mode, pullUpDown: Gpio.PUD_DOWN});
    }
}

class Hardware
{//the hardware class allows for the easy creation and management of the actual hardware connected to the pi

    constructor()
    {
        this.devices = [];
        //load in config and begin creating the devices
        for(let i = 0; i < config.hardware.length; i++)
        {
            this.devices.push(new Device(config.hardware[i].name, config.hardware[i].pin, config.hardware[i].mode));
        }
        this.thermostatPWM = {name: "Thermostat", value: 0};
    }

    pulse(name, duration)
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == name)
            {
                //we found the device 
                this.devices[i].dev.digitalWrite(1);
                setTimeout(() => this.devices[i].dev.digitalWrite(0), duration);
                return;
            }
        }
        console.log(`Queried Device: ${name} not found.`);
    }

    setPWM(name, value)
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == name)
            {
                this.thermostatPWM = {name: name, value: value}
            }
        }
        console.log(`Queried Device: ${name} not found.`);
    }

    update()
    {
        //update PWM for Themostat
        
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == this.thermostatPWM.name)
            {
                if(this.devices[i].dev.getPwmDutyCycle() < this.thermostatPWM.value)
                    this.devices[i].dev.pwmWrite(this.devices[i].dev.getPwmDutyCycle() + this.thermostatPWM.value / 10);
                else if (this.devices[i].dev.getPwmDutyCycle() > this.thermostatPWM.value)
                    this.devices[i].dev.pwmWrite(this.devices[i].dev.getPwmDutyCycle() - this.thermostatPWM.value / 10);
                return;
            }
        }
    }

}

const hw = new Hardware();

module.exports = hw;