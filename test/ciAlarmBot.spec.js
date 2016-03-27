/*global describe, it  */
var CiAlarmBot = require('../src/ciAlarmBot');
var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

describe('Bot Initialization', function() {

    it('should the BOT token present', function() {
        var ciAlarmBot = new CiAlarmBot('Fake-token');
        expect(ciAlarmBot.bot.token).to.be.equal('Fake-token');
    });

    it('should the BOT say hello to the the channel when start', function() {
        var textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', function(type, name, text) {
            textCheck = text;
        });

        var ciAlarmBot = new CiAlarmBot('Fake-token');

        ciAlarmBot.run();

        ciAlarmBot.bot.emit('start');

        expect(textCheck).to.be.equal('Keep calm I am the alarm!');

        this.slackbotStub.restore();
    });

});
