/*global describe, it*/
'use strict';
var RaspberryInterface = require('../src/raspberryInterface');
var expect = require('chai').expect;

describe('Bot CI GPIO comunication', function () {

    it('should the raspberry gpio work on pin passed to contructor', function () {
        this.raspberryInterface = new RaspberryInterface(22);
        this.raspberryInterface.flash();

        expect(this.raspberryInterface.gpioPin.headerNum).equal(22);
    });

});
