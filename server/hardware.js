
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
        this.thermostatPWM = {name: "Thermostat", value: 0, target:0, current:0};
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

    setPWM(name, value, target)
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == name)
            {
                this.thermostatPWM = {name: name, value: value, target:target, current: 0};
                return;
            }
        }
        console.log(`Queried Device: ${name} not found.`);
    }

    reset()
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            this.devices[i].dev.digitalWrite(0);
        }
    }

    update()
    {
        //update PWM for Themostat
        
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == this.thermostatPWM.name && (this.thermostatPWM.current + this.thermostatPWM.value) < 256)
            {
                if(this.thermostatPWM.target <= this.thermostatPWM.current)
                {
                    this.devices[i].dev.pwmWrite(this.thermostatPWM.current + this.thermostatPWM.value);
                    this.thermostatPWM.current = this.thermostatPWM.current + this.thermostatPWM.value;
                }
                else if (this.thermostatPWM.target > this.thermostatPWM.current && (this.thermostatPWM.current - this.thermostatPWM.value) >= 0)
                {
                    this.devices[i].dev.pwmWrite(this.thermostatPWM.current - this.thermostatPWM.value);
                    this.thermostatPWM.current = this.thermostatPWM.current - this.thermostatPWM.value;
                }
                return;
            }
        }

    }

}

const hw = new Hardware();

module.exports = hw;