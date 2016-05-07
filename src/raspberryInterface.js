'use strict';
var nconf = require('nconf');

class raspberryInterface {

    constructor() {
        var gpioPinDefault = 22;
        // var projectToAlarm = process.env.PROJECT_TO_ALARM || nconf.get('projectToAlarm');
        this.pin = nconf.get('gpioPin') || gpioPinDefault;
    }

    flash() {
        try {
            var gpio = require('pi-gpio');

            gpio.open(this.pin, 'output', (err)=> {
                if (!err) {
                    gpio.write(this.pin, 1, () => {
                        gpio.close(this.pin);
                    });
                } else {
                    console.log('error raspberry' + err);
                }
            });
        } catch (error) {
            console.log('not raspberry' + error);
        }
    }

    stopFlash() {
        try {
            var gpio = require('pi-gpio');

            gpio.open(this.pin, 'output', (err)=> {
                if (!err) {
                    gpio.write(this.pin, 0, () => {
                        gpio.close(this.pin);
                    });
                } else {
                    console.log('error raspberry' + err);
                }
            });
        } catch (error) {
            console.log('not raspberry' + error);
        }
    }
}

module.exports = raspberryInterface;
