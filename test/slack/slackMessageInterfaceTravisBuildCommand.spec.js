/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../../src/slack/slackMessageInterface');
var TravisService = require('../../src/travis/travisService');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var nock = require('nock');

var Repository = require('../../test/mockObjects/repository');
var Channel = require('../../test/mockObjects/channel');

describe('Slack Travis Build Command', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, 'postTo', (name, text, params) => {
            this.textCheck = params.attachments[0].text;
            this.colorMessage = params.attachments[0].color;
        });

        this.loginStub = sinon.stub(Bot.prototype, 'login', function() {});

        this.travisService = new TravisService('github-token');
        this.travisService.username = 'mbros';

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', this.travisService);
        this.slackMessageInterface.bot.self = {id: '1234'};
        this.slackMessageInterface.bot.channels = Channel.createChannelList();
        this.slackMessageInterface.run();
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
        nock.cleanAll();
    });

    it('should the bot rebuild the last build  if asked "rebuild fakeuser/fake-project2" ', function (done) {
        var repos = Repository.createRepositoriesList();

        nock('https://api.travis-ci.org:443')
            .get('/repos/' + this.travisService.username)
            .reply(200, {repos});

        nock('https://api.travis-ci.org:443')
            .post('/builds/120506232/restart')
            .reply(200, {});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: build fakeuser/fake-project2'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Build is Running');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot rebuild answer with suggestion if the slug is missing ', function (done) {
        var repos = Repository.createRepositoriesList();

        nock('https://api.travis-ci.org:443')
            .get('/repos/' + this.travisService.username)
            .reply(200, {repos});

        nock('https://api.travis-ci.org:443')
            .post('/builds/120506232/restart')
            .reply(200, {});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: build '
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Maybe you want use the command : "build username/example-project" but you forgot to add the repository slug');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });

    it('should the bot rebuild answer with suggestion if the slug is missing in the build command', function (done) {
        var repos = Repository.createRepositoriesList();

        nock('https://api.travis-ci.org:443')
            .get('/repos/' + this.travisService.username)
            .reply(200, {repos});

        nock('https://api.travis-ci.org:443')
            .post('/builds/120506232/restart')
            .reply(200, {});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: build fake/repo22 '
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('This repositories doesn\'t exist');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });
});
