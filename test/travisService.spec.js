/*jshint expr:true */
/*global describe, it, beforeEach, afterEach */
'use strict';

var TravisService = require('../src/travisService');
var TravisAuth = require('../src/travisAuth');

var Repository = require('../test/mockObjects/repository');

var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');

describe('Travis Service', function () {

    describe('Init', function () {

        it('Should throw an error if no GitHub token is passed', function () {
            var errorThrown = false;
            try {
                this.TravisService = new TravisService();
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });

        it('Should not throw an error if GitHub token is passed', function () {
            var errorThrown = false;
            try {
                this.TravisService = new TravisService('fake-github-token');
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(false);
        });

        it('Should login executed', function () {
            this.travisAuthStub = sinon.spy(TravisAuth.prototype, 'login');
            this.TravisService = new TravisService('fake-github-token');

            expect(this.travisAuthStub).to.have.been.called;

            this.travisAuthStub.restore();
        });

    });

    describe('Event', function () {

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

    describe('Api Get info', function () {
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
            this.travisService = new TravisService('fake-github-token');
        });

        afterEach(function () {
            this.travisAuthStub.restore();
            this.travisGetAccountInfo.restore();
        });

        it('Should Get getUserRepositoriesSlugList return the repositories slug list', function (done) {
            this.travisService.username = 'mbros';

            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/mbros')
                .reply(200, {repos});

            var slugListResponse;
            this.travisService.getUserRepositoriesSlugList().then((repoList)=> {
                slugListResponse = repoList.toString();
            });

            setTimeout(()=> {
                expect(slugListResponse).equals('fakeuser/fake-project1,fakeuser/fake-project2,fakeuser/fake-project3');
                done();
            }, 50);

        });

        it('Should Get getLastbuildStatusByRepository return the status of the repository passed', function (done) {
            this.travisService.username = 'mbros';

            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/mbros')
                .reply(200, {repos});

            var buildStatusResponse;
            this.travisService.getLastBuildStatusByRepository('fakeuser/fake-project2').then((status)=> {
                buildStatusResponse = status;
            });

            setTimeout(()=> {
                expect(buildStatusResponse.last_build_state).equals('failed');
                done();
            }, 50);

        });

        it('Should Get getLastbuildStatusByRepository return an error if the the repository doesn t exist' , function (done) {
            this.travisService.username = 'mbros';

            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/mbros')
                .reply(200, {repos});

            var buildStatusResponse;
            this.travisService.getLastBuildStatusByRepository('fakeuser/fake-porject90').then((status)=> {
                buildStatusResponse = status.toString();
            },(error)=> {
                buildStatusResponse = error.toString();
            });

            setTimeout(()=> {
                expect(buildStatusResponse).equals('Error: This repositories dosen\'t exixst');
                done();
            }, 50);

        });
    });
});
