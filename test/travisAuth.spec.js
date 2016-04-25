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

    describe('login', function () {

        it('Should throw an error if the Github token is not a valid token for github', function (done) {
            var errorThrown = false;

            var travisAuth = new TravisAuth(new TravisService('fake-token'), 'fake-token');
            travisAuth._authenticateGitHub().then(()=> {
                errorThrown = false;
                expect(errorThrown).equals(true);
                done();
            }, ()=> {
                errorThrown = true;
                expect(errorThrown).equals(true);
                done();
            });

        });

        it('Should throw an error if the Travis token is not a valid token', function (done) {
            var errorThrown = false;

            var travisAuth = new TravisAuth(new TravisService('fake-token'), 'fake-token');
            travisAuth._authenticateTravis('fake').then(()=> {
                errorThrown = false;
                expect(errorThrown).equals(true);
                done();
            }, (res)=> {
                console.log(res);
                errorThrown = true;
                expect(errorThrown).equals(true);
                done();
            });

        });

    });
});
