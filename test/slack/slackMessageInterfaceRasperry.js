/*global describe, it, beforeEach, afterEach */
'use strict';
var SlackMessageInterface = require('../../src/slack/slackMessageInterface');
var TravisService = require('../../src/travis/travisService');
var RaspberryInterface = require('../../src/raspberryInterface');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var nock = require('nock');

var Channel = require('../../test/mockObjects/channel');

describe('Bot CI General Travis info communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, 'postTo', (name, text, params) => {
            this.textCheck = params.attachments[0].text;
            this.colorMessage = params.attachments[0].color;
            this.fields = params.attachments[0].fields;
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

    it('should the bot respond with the suggestion if asked "alarm" without specify if on or off ', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: alarm'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Alarm message not valid type \"alarm on OR alarm off\"');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 60);
    });

    it.skip('should the bot respond with an error if try to use alarm on or off in a not raspberry device', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: alarm on'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Alarm functionality is possible only for ci-alarm installed on a Raspberry Pi');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 60);
    });

    it('should the bot respond with Alarm on  if asked "alarm on"', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: alarm on'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Alarm on');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 60);
    });

    it('should the bot respond with Alarm on  if asked "alarm off"', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: alarm off'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Alarm off');
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            done();
        }, 60);
    });
});

