/*jshint expr:true */
/*global describe, it, beforeEach, afterEach */
'use strict';
var TravisService = require('../src/travis/travisService');

var Repository = require('../test/mockObjects/repository');

var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');

describe('Travis Service Post Api', function () {

    beforeEach(function () {
        this.loginTravisStub = sinon.stub(TravisService.prototype, '_loginTravis', function() {});

        this.travisService = new TravisService('fake-github-token');
        this.travisService.username = 'mbros';
    });

    afterEach(function () {
        this.loginTravisStub.restore();
        nock.cleanAll();
    });

    it('Should restartLastBuild send a post for restart the last build', function (done) {
        var repos = Repository.createRepositoriesList();

        nock('https://api.travis-ci.org:443')
            .get('/repos/' + this.travisService.username)
            .reply(200, {repos});

        nock('https://api.travis-ci.org:443')
            .post('/builds/120506232/restart')
            .reply(200, {});

        var statusCodeAnswer;
        this.travisService.restartLastBuild('fakeuser/fake-project2').then((statusCode)=> {
            statusCodeAnswer = statusCode;
        });

        setTimeout(()=> {
            expect(statusCodeAnswer).equals(200);
            done();
        }, 50);
    });
});
