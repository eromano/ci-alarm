/*jshint expr:true */
/*global describe, it */
'use strict';

var TravisAuth = require('../src/travisAuth');
var TravisService = require('../src/travisService');

var expect = require('chai').expect;

describe('Travis Auth', function () {

    describe('Init', function () {

        it('Should throw an error if no Travis service is passed', function () {
            var errorThrown = false;
            try {
                new TravisAuth(null, 'fake-token');
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });

        it('Should throw an error if no GitHub token is passed', function () {
            var errorThrown = false;
            try {
                new TravisAuth(new TravisService('fake-token'), null);
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });

        it('Should init be ok if Travis service and github token is passed', function () {
            var errorThrown = false;

            try {
                new TravisAuth(new TravisService('fake-token'), 'fake-token');
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(false);
        });

    });

    describe('login Github', function () {

        it('Should throw an error if the Github token is not a valid token for github', function () {
            var errorThrown = false;
            try {
                var travisAuth  = new TravisAuth(new TravisService('fake-token'), 'fake-token');
                travisAuth.authenticateGitHub();
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });

    });
});
