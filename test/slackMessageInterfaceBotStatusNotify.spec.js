/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../src/slackMessageInterface');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var TravisService = require('../src/travisService');
var nock = require('nock');
var Repository = require('../test/mockObjects/repository');

describe('Bot CI build communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text, message) {
            this.textCheck = message.attachments[0].text;
            this.colorMessage = message.attachments[0].color;
        }).bind(this));

        this.loginStub = sinon.stub(Bot.prototype, 'login', function () {});

        this.travisService =  new TravisService('github-token');
        this.travisService.username = 'mbros';

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', this.travisService);
        this.slackMessageInterface.run();
        this.slackMessageInterface.bot.self = {id: '1234'};
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the suggestion if asked "build status" without a slug repository', function (done) {
        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Maybe you want use the command : "status username/example-project" but you forgot to add the repository slug');
            done();
        }, 50);
    });

    it('should the bot respond with the Error if asked "build status" of not present repository', function (done) {
        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status mbros/project-fake99'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Error: This repositories dosen\'t exixst');
            done();
        }, 50);
    });

    it('should the bot respond with the Success Build status if asked "build status" and has received a status success from ci', function (done) {
        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fakeuser/fake-project1'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is passed!');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.successColor);
            done();
        }, 50);
    });

    it('should the bot respond with the Failed Build status if asked "build status" and has received a status fail from ci', function (done) {
        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fakeuser/fake-project2'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is failed!');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.failColor);
            done();
        }, 50);

    });

});
