/*jshint expr:true */
/*global describe, it, beforeEach, afterEach */
'use strict';

var TravisService = require('../src/travis/travisService');
var TravisAuth = require('../src/travis/travisAuth');

var expect = require('chai').expect;
var sinon = require('sinon');

describe('Travis Service', function () {

    afterEach(function () {
        delete this.travisService;
    });

    describe('Init', function () {

        it('Should throw an error if no GitHub token is passed', function () {
            var errorThrown = false;
            try {
                this.travisService = new TravisService();
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });

        it('Should not throw an error if GitHub token is passed', function () {
            var errorThrown = false;
            try {
                this.travisService = new TravisService('fake-github-token');
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(false);
        });

        it('Should login executed', function () {
            this.travisAuthStub = sinon.spy(TravisAuth.prototype, 'login');
            this.travisService = new TravisService('fake-github-token');

            expect(this.travisAuthStub).to.have.been.called;

            this.travisAuthStub.restore();
        });

    });

    describe('Should emit an success event', function () {
        beforeEach(function () {
            this.travisAuthStub = sinon.stub(TravisAuth.prototype, 'login', ()=> {
                return new Promise(((resolve) => {
                    resolve();
                }));
            });

            this.travisGetAccountInfo = sinon.stub(TravisService.prototype, 'getAccountInfo', ()=> {
                return new Promise(((resolve) => {
                    resolve();
                }));
            });
        });

        afterEach(function () {
            this.travisAuthStub.restore();
            this.travisGetAccountInfo.restore();
        });

        it('travis:login:ok when the login is ok', function (done) {
            var spyEventLoginOk = sinon.spy();

            this.travisService = new TravisService('fake-github-token');
            this.travisService.on('travis:login:ok', spyEventLoginOk);

            setTimeout(function () {
                expect(spyEventLoginOk.called).equals(true);
                done();
            }, 10);

        });
    });

    describe('Should emit an error  event', function () {
        beforeEach(function () {
            this.travisAuthStub = sinon.stub(TravisAuth.prototype, 'login', ()=> {
                return new Promise(((resolve) => {
                    resolve();
                }));
            });

            this.travisGetAccountInfo = sinon.stub(TravisService.prototype, 'getAccountInfo', ()=> {
                return new Promise(((resolve, reject) => {
                    reject();
                }));
            });
        });

        afterEach(function () {
            this.travisAuthStub.restore();
            this.travisGetAccountInfo.restore();
        });

        it('travis:login:error when the login is NOT ok', function (done) {
            var spyEventLoginError = sinon.spy();

            this.travisService = new TravisService('fake-github-token');
            this.travisService.on('travis:login:error', spyEventLoginError);

            setTimeout(function () {
                expect(spyEventLoginError.called).equals(true);
                done();
            }, 10);
        });
    });

});
