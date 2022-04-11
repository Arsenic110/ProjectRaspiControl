
const config = require('../config.json');
const Gpio = require("pigpio").Gpio;

class Device
{//small, internal wrapper class for GPIO devices
    constructor(name, pin, mode, def)
    {
        this.name = name;
        this.pin = pin;
        this.mode = Gpio.OUTPUT;

        this.default = 
        
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
            this.devices.push(new Device(config.hardware[i].name, config.hardware[i].pin, config.hardware[i].mode, config.hardware[i].default));
        }
        
        this.thermostatPWM = {name: "Thermostat", value: 0, target:0, current:0};

        for(let i = 0; i < this.devices.length; i++)
        {
            console.log(`Setting Default ${this.devices[i].def} for ${this.devices[i].name}, on pin ${this.devices[i].pin}`);
            let o = 0;
            if(this.devices[i].def == 'high')
                o = 1;
            this.setState(this.devices[i].name, o);
        }
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

    setState(name, state)
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == name)
            {
                //we found the device 
                this.devices[i].dev.digitalWrite(state);
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
                this.thermostatPWM = {name: name, value: value, target:target, current:this.thermostatPWM.current};
                return;
            }
        }
        console.log(`Queried Device: ${name} not found.`);
    }

    reset(name)
    {
        if(name)
            for(let i = 0; i < this.devices.length; i++)
            {
                if(this.devices[i].name == name)
                {
                    this.devices[i].dev.digitalWrite(0);
                    return;
                }

            }
        else
            for(let i = 0; i < this.devices.length; i++)
            {
                this.devices[i].dev.digitalWrite(0);
                return;
            }
    }

    toggle(name)
    {
        for(let i = 0; i < this.devices.length; i++)
        {
            if(this.devices[i].name == name)
            {
                this.devices[i].dev.digitalWrite(!this.devices[i].dev.digitalRead());
                return;
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
                if(this.thermostatPWM.target <= this.thermostatPWM.current && (this.thermostatPWM.current - this.thermostatPWM.value) >= 0)
                {
                    this.devices[i].dev.pwmWrite(this.thermostatPWM.current - this.thermostatPWM.value);
                    this.thermostatPWM.current = this.thermostatPWM.current - this.thermostatPWM.value;
                }
                if (this.thermostatPWM.target > this.thermostatPWM.current && (this.thermostatPWM.current + this.thermostatPWM.value) < 256)
                {
                    this.devices[i].dev.pwmWrite(this.thermostatPWM.current + this.thermostatPWM.value);
                    this.thermostatPWM.current = this.thermostatPWM.current + this.thermostatPWM.value;
                }
                return;
            }
        }

    }

}

const hw = new Hardware();

module.exports = hw;