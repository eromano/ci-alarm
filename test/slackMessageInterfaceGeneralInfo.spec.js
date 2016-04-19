/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../src/slackMessageInterface');
var TravisService = require('../src/travisService');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var nock = require('nock');

var Repository = require('../test/mockObjects/repository');
var Channel = require('../test/mockObjects/channel');
var Build = require('../test/mockObjects/build');

describe('Bot CI General Travis info communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, 'postTo', (name, text, params) => {
            this.textCheck = params.attachments[0].text;
            this.colorMessage = params.attachments[0].color;
        });

        this.loginStub = sinon.stub(Bot.prototype, 'login');

        this.travisService =  new TravisService('github-token');
        this.travisService.username = 'mbros';

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', this.travisService);
        this.slackMessageInterface.bot.self = {id: '1234'};
        this.slackMessageInterface.bot.channels = Channel.createChannelList();
        this.slackMessageInterface.run();
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the repositories list if asked "repository list" ', function (done) {
        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: repository list'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> this is the repository list: \n • fakeuser/fake-project1\n• fakeuser/fake-project2\n• fakeuser/fake-project3');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot respond with the command list if asked "command list" ', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: command list'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> <this is the command list|https://github.com/eromano/ci-alarm/wiki/Command-List> \n • status username/example-project  \n • repository list \n • command list \n • [build|rebuild] username/example-project  \n • history username/example-project • info username/example-project');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot respond with the command list if asked "help" ', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: command list'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> <this is the command list|https://github.com/eromano/ci-alarm/wiki/Command-List> \n • status username/example-project  \n • repository list \n • command list \n • [build|rebuild] username/example-project  \n • history username/example-project • info username/example-project');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot respond with the build history if asked : "history username/example-project" ', function (done) {
        var buildsList = Build.createBuildsList();

        nock('https://api.travis-ci.org:443')
            .get('/repos/' + this.travisService.username + '/fake-project3/builds')
            .reply(200, buildsList);

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: history ' + this.travisService.username + '/fake-project3'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Build #53 was passed\nBuild #53 was passed\nBuild #53 was passed\n');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot respond with the information about a repository id asked : "info username/example-project" ', function (done) {
        var repos = Repository.createRepositoriesList();

        nock('https://api.travis-ci.org:443').get('/repos/' + this.travisService.username).reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: info fake-project3'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Repository fakeuser/fake-project3 status \nfake repo description\n');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot respond with the information about a commit id asked : "commit info a18f211f6f921affd1ecd8c18691b40d9948aae5" ', function () {

    });
});
