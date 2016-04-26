/*jshint expr:true */
/*global describe, it */
'use strict';

var TravisHook = require('../src/travisHook');
var expect = require('chai').expect;

describe('Travis Hook', function () {

    describe('init', function () {

        it('Should throw an error if no Travis token is passed', function () {
            var errorThrown = false;
            try {
                this.travisHook = new TravisHook();
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });
    });

    describe('event', function () {

        it('Should send a message on slack if the build is success', function () {

        });

        it('Should send a message on slack if the build is failing', function () {

        });

        it('Should send a message on slack if the build is started', function () {

        });
    });
});
