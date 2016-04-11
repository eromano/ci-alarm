/*jshint expr:true */
/*global describe, it, beforeEach, afterEach */
'use strict';

var TravisService = require('../src/travisService');
var TravisAuth = require('../src/travisAuth');

var Repository = require('../test/mockObjects/repository');
var Build = require('../test/mockObjects/build');

var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');

describe('Travis Service', function () {

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
            this.travisService.username = 'mbros';

        });

        afterEach(function () {
            this.travisAuthStub.restore();
            this.travisGetAccountInfo.restore();
        });

        it('Should Get getUserRepositoriesSlugList return the repositories slug list', function (done) {
            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/' + this.travisService.username)
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
            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/' + this.travisService.username)
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

        it('Should Get LastbuildStatusByRepository return an error if the the repository doesn t exist', function (done) {
            var repos = Repository.createRepositoriesList();

            nock('https://api.travis-ci.org:443')
                .get('/repos/' + this.travisService.username)
                .reply(200, {repos});

            var buildStatusResponse;
            this.travisService.getLastBuildStatusByRepository('fakeuser/fake-porject90').then((status)=> {
                buildStatusResponse = status.toString();
            }, (error)=> {
                buildStatusResponse = error.toString();
            });

            setTimeout(()=> {
                expect(buildStatusResponse).equals('Error: This repositories dosen\'t exixst');
                done();
            }, 50);

        });

        it('Should Get getCommitInfoBybuildNumber return the commit information by build number', function (done) {
            var build = Build.createBuild();

            nock('https://api.travis-ci.org:443')
                .get('/builds/122131187')
                .reply(200, build);

            var buildCommitInfo;
            this.travisService.getCommitInfoByBuildNumber('122131187').then((commit)=> {
                buildCommitInfo = commit;
            }, (error)=> {
                buildCommitInfo = error.toString();
            });

            setTimeout(()=> {
                expect(buildCommitInfo.message).equals('fake-commit-message');
                done();
            }, 50);
        });

    });
});
