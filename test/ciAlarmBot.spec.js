/*global describe, it, beforeEach, afterEach */
var CiAlarmBot = require('../src/ciAlarmBot');
var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

describe('Bot Initialization', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text, message) {
            this.textCheck = message.attachments[0].text;
        }).bind(this));

        this.ciAlarmBot = new CiAlarmBot('Fake-token','B0W93JU9Y');
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

    it('should Not respond with the Build status if asked by ciAlarmBot', function () {
        this.ciAlarmBot.bot.emit('message', {username: this.ciAlarmBot.bot.name, type: 'message', text: 'status'});

        expect(this.textCheck).to.be.equal('');
    });

    it('should Not respond with the Build status if is not a chat message', function () {
        this.ciAlarmBot.bot.emit('message', {type: 'reconnect_url'});

        expect(this.textCheck).to.be.equal('');
    });

});
