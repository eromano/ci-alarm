/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../src/slackMessageInterface');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

describe('Bot CI build communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        this.slackbotStub = sinon.stub(Bot.prototype, '_post', (function (type, name, text, message) {
            this.textCheck = message.attachments[0].text;
            this.colorMessage = message.attachments[0].color;
        }).bind(this));

        this.loginStub = sinon.stub(Bot.prototype, 'login', function () {});

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', 'B0W93JU9Y');
        this.slackMessageInterface.run();
        this.slackMessageInterface.bot.self = {id: '1234'};
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the Unknown Build status if asked "build status" and has never received a status', function () {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Unknown!');
    });

    it('should the bot respond with the Success Build status if asked "build status" and has received a status success from ci', function () {
        this.slackMessageInterface.bot.emit('message', {
            bot_id: this.slackMessageInterface.ciBotId,
            type: 'message',
            attachments: [
                {
                    'text': 'something bla passed bla'
                }
            ]
        });

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Success!');
        expect(this.colorMessage).to.be.equal(this.slackMessageInterface.successColor);
    });

    it('should the bot respond with the Failed Build status if asked "build status" and has received a status fail from ci', function () {
        this.slackMessageInterface.bot.emit('message', {
            bot_id: this.slackMessageInterface.ciBotId,
            type: 'message',
            attachments: [
                {
                    'text': 'something bla failed bla'
                }
            ]
        });

        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status'
        });

        expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status is Failed!');
        expect(this.colorMessage).to.be.equal(this.slackMessageInterface.failColor);
    });

});
