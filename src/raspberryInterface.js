'use strict';
var gpio = require('gpio');
var nconf = require('nconf');

class raspberryInterface {

    constructor() {
        var gpioPinDefault = 22;
        // var projectToAlarm = process.env.PROJECT_TO_ALARM || nconf.get('projectToAlarm');
        var gpioPin = nconf.get('gpioPin') || gpioPinDefault;

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
