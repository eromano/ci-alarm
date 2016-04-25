/*jshint expr:true */
/*global describe, it */
'use strict';

var TravisHook = require('../src/travisHook');
var expect = require('chai').expect;

describe('Travis Hook', function () {

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
