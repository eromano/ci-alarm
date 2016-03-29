/*global describe, it, beforeEach, afterEach */
var CiAlarmBot = require('../src/ciAlarmBot');
var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

describe('Bot Initialization', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text) {
            this.textCheck = text;
        }).bind(this));

        this.ciAlarmBot = new CiAlarmBot('Fake-token');

        this.ciAlarmBot.run();
    });

    afterEach(function () {
        this.slackbotStub.restore();
    });

    it('should the BOT token present', function () {
        expect(this.ciAlarmBot.bot.token).to.be.equal('Fake-token');
    });

    it('should the BOT say hello to the the channel when start', function () {
        this.ciAlarmBot.bot.emit('start');

        expect(this.textCheck).to.be.equal('Keep calm I am the alarm!');
    });

    it('should the bot respond with the Build status if asked "build status"', function () {
        this.ciAlarmBot.bot.self = { id: '1234'};

        this.ciAlarmBot.bot.emit('message', {username: 'Sonikku', type: 'message', text: '<@' + this.ciAlarmBot.bot.self.id + '>: tell me something'});

        expect(this.textCheck).to.be.equal('Build Status is Unknown!');
    });

    it('should Not respond with the Build status if asked by ciAlarmBot', function () {
        this.ciAlarmBot.bot.emit('message', {username: this.ciAlarmBot.bot.name, type: 'message', text: 'tell me something'});

        expect(this.textCheck).to.be.equal('');
    });

    it('should Not respond with the Build status if is not a chat message', function () {
        this.ciAlarmBot.bot.emit('message', {type: 'reconnect_url'});

        expect(this.textCheck).to.be.equal('');
    });

});
