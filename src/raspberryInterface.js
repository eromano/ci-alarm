'use strict';
var gpio = require('gpio');
var nconf = require('nconf');

class raspberryInterface {

    constructor() {
        var gpioPinDefault = 22;
        this.pin = nconf.get('gpioPin') || gpioPinDefault;

        this.gpioPin = gpio.export(this.pin, {
            interval: 200,
            ready: function () {
                console.log('gpio ready');
            }
        });
        this.gpioPin.setDirection('out');
    }

    flash() {
        if (this.gpioPin) {
            console.log('pin ' + this.pin + ' on');
            this.gpioPin.set(1);
        }

        setTimeout(()=> {
            this.stopFlash();
        }, 10000);
    }

    stopFlash() {
        if (this.gpioPin) {
            console.log('pin ' + this.pin + ' off');
            this.gpioPin.set(0);
        }
    }
}

module.exports = raspberryInterface;
