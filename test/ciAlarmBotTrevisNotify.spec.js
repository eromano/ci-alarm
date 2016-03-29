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

    it('should the BOT get the build status from the travis CI message', function () {
        expect(this.ciAlarmBot.bot.token).to.be.equal('Fake-token');
    });
});
