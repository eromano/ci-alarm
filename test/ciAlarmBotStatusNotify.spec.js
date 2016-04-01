/*global describe, it, beforeEach, afterEach */
var CiAlarmBot = require('../src/ciAlarmBot');
var TravisInterface = require('../src/travisInterface');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

describe('Bot CI communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.constructorStub = sinon.stub(TravisInterface.prototype, 'constructor', function () {});

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text, message) {
            this.textCheck = message.attachments[0].text;
            this.colorMessage = message.attachments[0].color;
        }).bind(this));

        this.loginStub = sinon.stub(Bot.prototype, 'login', function () {});

        this.ciAlarmBot = new CiAlarmBot('Fake-token-slack', 'B0W93JU9Y', 'fake-token-github');
        this.ciAlarmBot.run();
        this.ciAlarmBot.bot.self = {id: '1234'};
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.constructorStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the Unknown Build status if asked "build status" and has never received a status', function () {
        this.ciAlarmBot.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.ciAlarmBot.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Unknown!');
    });

    it('should the bot respond with the Success Build status if asked "build status" and has received a status success from ci', function () {
        this.ciAlarmBot.bot.emit('message', {
            bot_id: this.ciAlarmBot.ciBotId,
            type: 'message',
            attachments: [
                {
                    'text': 'something bla passed bla'
                }
            ]
        });

        this.ciAlarmBot.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.ciAlarmBot.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Success!');
        expect(this.colorMessage).to.be.equal(this.ciAlarmBot.successColor);
    });

    it('should the bot respond with the Failed Build status if asked "build status" and has received a status fail from ci', function () {
        this.ciAlarmBot.bot.emit('message', {
            bot_id: this.ciAlarmBot.ciBotId,
            type: 'message',
            attachments: [
                {
                    'text': 'something bla failed bla'
                }
            ]
        });

        this.ciAlarmBot.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.ciAlarmBot.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Failed!');
        expect(this.colorMessage).to.be.equal(this.ciAlarmBot.failColor);
    });

});
