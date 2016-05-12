/*jshint expr:true */
/*global describe, it, beforeEach, afterEach*/
'use strict';

var SlackMessageInterface = require('../../src/slack/slackMessageInterface');
var TravisHook = require('../../src/travis/travisHook');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');

var Channel = require('../../test/mockObjects/channel');
var HookMessage = require('../../test/mockObjects/hookMessage');

describe('Travis Hook', function () {

    describe('init', function () {
        it('Should throw an error if no Travis token is passed', function () {
            var errorThrown = false;
            try {
                this.travisHook = new TravisHook();
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).equals(true);
        });
    });

    describe('event', function () {

        beforeEach(function () {
            this.slackbotStub = sinon.stub(Bot.prototype, 'postTo', (name, text, params) => {
                this.textCheck = params.attachments[0].text;
                this.colorMessage = params.attachments[0].color;
                this.fields = params.attachments[0].fields;
                this.title = params.attachments[0].title;
                this.title_link = params.attachments[0].title_link;
            });

            this.loginStub = sinon.stub(Bot.prototype, 'login', function () {
            });
            this.travisHookStub = sinon.stub(TravisHook.prototype, '_instantiateHandler', function () {
            });

            this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack');
            this.slackMessageInterface.bot.self = {id: '1234'};
            this.slackMessageInterface.bot.channels = Channel.createChannelList();
            this.slackMessageInterface.run();

            this.travisHook = new TravisHook(this.slackMessageInterface, 'Fake-token-travis');
        });

        afterEach(function () {
            this.slackbotStub.restore();
            this.loginStub.restore();
            this.travisHookStub.restore();
        });

        it('Should send a message on slack if the build is success', function (done) {
            var event = {};
            event.payload = HookMessage.createHookMessage();
            this.travisHook.handler.emit('success', event);

            setTimeout(()=> {
                expect(this.textCheck).to.be.equal('Build #<https://travis-ci.org/svenfuchs/minimal/builds/1|#1> on the project minimal is :white_check_mark: Passed triggered by Sven Fuchs <https://github.com/svenfuchs/minimal/compare/master...develop|Commit>');// jscs:ignore maximumLineLength
                expect(this.colorMessage).to.be.equal(this.slackMessageInterface.successColor);
                done();
            }, 50);
        });

        it('Should send a message on slack if the build is failing', function (done) {
            var event = {};
            event.payload = HookMessage.createHookMessage({status_message: 'failed'});
            this.travisHook.handler.emit('failure', event);

            setTimeout(()=> {
                expect(this.textCheck).to.be.equal('Build #<https://travis-ci.org/svenfuchs/minimal/builds/1|#1> on the project minimal is :warning: failed triggered by Sven Fuchs <https://github.com/svenfuchs/minimal/compare/master...develop|Commit>');// jscs:ignore maximumLineLength
                expect(this.colorMessage).to.be.equal(this.slackMessageInterface.failColor);
                done();
            }, 50);
        });
    });
});
