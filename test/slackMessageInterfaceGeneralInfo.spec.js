/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../src/slackMessageInterface');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var TravisService = require('../src/travisService');
var nock = require('nock');
var Repository = require('../test/mockObjects/repository');

describe('Bot CI General Travis info communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text, message) {
            this.textCheck = message.attachments[0].text;
            this.colorMessage = message.attachments[0].color;
        }).bind(this));

        this.loginStub = sinon.stub(Bot.prototype, 'login');

        this.travisService =  new TravisService('github-token');

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', 'B0W93JU9Y', this.travisService);
        this.slackMessageInterface.run();
        this.slackMessageInterface.bot.self = {id: '1234'};
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the repositories list if asked "repository list" ', function (done) {
        this.travisService.username = 'mbros';

        var repos = Repository.createRepositoriesList();
        nock('https://api.travis-ci.org:443')
            .get('/repos/mbros')
            .reply(200, {repos});

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: repository list'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> this is the repository list: \n • fakeuser/fake-project1\n• fakeuser/fake-project2\n• fakeuser/fake-project3Repository list');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 50);
    });
});
