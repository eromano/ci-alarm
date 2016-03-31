'use strict';
var gpio = require('gpio');

class raspberryInterface {

    constructor(gpioPin) {

        this.gpioPin = gpio.export(gpioPin, {
            interval: 200,
            ready: function () {
                console.log('gpio ready');
            }
        });
        this.gpioPin.setDirection('out');
    }

    flash() {
        if (this.gpioPin) {
            this.gpioPin.set(1);
        }
    }

    stopFlash() {
        if (this.gpioPin) {
            this.gpioPin.reset();
        }
    }
}

module.exports = raspberryInterface;
