/*global describe, it, beforeEach, afterEach */
'use strict';

var SlackMessageInterface = require('../src/slackMessageInterface');
var TravisService = require('../src/travisService');

var expect = require('chai').expect;
var sinon = require('sinon');
var Bot = require('slackbots');
var nock = require('nock');

var Repository = require('../test/mockObjects/repository');
var Channel = require('../test/mockObjects/channel');
var Build = require('../test/mockObjects/build');

describe('Bot CI build communication', function () {

    beforeEach(function () {
        this.textCheck = '';

        var build = Build.createBuild();
        var repos = Repository.createRepositoriesList();

        this.slackbotStub = sinon.stub(Bot.prototype, 'postTo', (name, text, params) => {
            this.textCheck = params.attachments[0].text;
            this.colorMessage = params.attachments[0].color;
            this.fields = params.attachments[0].fields;
            this.title = params.attachments[0].title;
            this.title_link = params.attachments[0].title_link;
        });

        this.loginStub = sinon.stub(Bot.prototype, 'login', function () {});

        this.travisService =  new TravisService('github-token');
        this.travisService.username = 'mbros';

        nock('https://api.travis-ci.org:443').get('/repos/' + this.travisService.username).reply(200, {repos});
        nock('https://api.travis-ci.org:443').get('/builds/120506232').reply(200, build);

        this.slackMessageInterface = new SlackMessageInterface('Fake-token-slack', this.travisService);
        this.slackMessageInterface.bot.self = {id: '1234'};
        this.slackMessageInterface.bot.channels = Channel.createChannelList();
        this.slackMessageInterface.run();
    });

    afterEach(function () {
        this.slackbotStub.restore();
        this.loginStub.restore();
    });

    it('should the bot respond with the suggestion if asked "build status" without a slug repository', function (done) {
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
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status mbros/project-fake99'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Error: This repositories doesn\'t exist');
            done();
        }, 50);
    });

    it('should the bot respond with the Success Build status if asked "build status" and has received a status success from ci', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fakeuser/fake-project1'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status was *passed* a few seconds ago \n *Commit* : <https://github.com/fakeuser/fake-project1/commit/6aace211abf84f16d74f195109bc91433dc437f4|Link github>fake-commit-message');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.successColor);
            expect(JSON.stringify(this.fields[0])).to.be.equal('{"title":"Elapsed time","value":"52 sec","short":true}');
            expect(JSON.stringify(this.fields[1])).to.be.equal('{"title":"Build Number","value":' +
                '"<https://travis-ci.org/fakeuser/fake-project1/builds/120506232|Build #37>","short":true}');
            expect(this.title_link).to.be.equal('https://travis-ci.org/fakeuser/fake-project1/builds/120506232');
            done();
        }, 50);
    });

    it('should the bot respond with the Failed Build status if asked "build status" and has received a status fail from ci', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fakeuser/fake-project2'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status was *failed* a few seconds ago \n *Commit* : <https://github.com/fakeuser/fake-project2/commit/6aace211abf84f16d74f195109bc91433dc437f4|Link github>fake-commit-message');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.failColor);
            expect(JSON.stringify(this.fields[0])).to.be.equal('{"title":"Elapsed time","value":"52 sec","short":true}');
            expect(JSON.stringify(this.fields[1])).to.be.equal('{"title":"Build Number","value":' +
                '"<https://travis-ci.org/fakeuser/fake-project2/builds/120506232|Build #37>","short":true}');
            expect(JSON.stringify(this.fields[2])).to.be.equal('{"title":"Possible Failing Guilty","value":"Eugenio Romano","short":true}');
            expect(this.title_link).to.be.equal('https://travis-ci.org/fakeuser/fake-project2/builds/120506232');
            done();
        }, 50);

    });

    it('should the bot respond with the Unknown Build status if asked "build status" and travis not has this repo in the CI', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fakeuser/fake-project3'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status was *unknown* a few seconds ago \n *Commit* : <https://github.com/fakeuser/fake-project3/commit/6aace211abf84f16d74f195109bc91433dc437f4|Link github>fake-commit-message');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            expect(JSON.stringify(this.fields[0])).to.be.equal('{"title":"Elapsed time","value":"52 sec","short":true}');
            expect(JSON.stringify(this.fields[1])).to.be.equal('{"title":"Build Number","value":' +
                '"<https://travis-ci.org/fakeuser/fake-project3/builds/120506232|Build #37>","short":true}');
            expect(this.title_link).to.be.equal('https://travis-ci.org/fakeuser/fake-project3/builds/120506232');
            done();
        }, 50);
    });

    it('should the bot respond with the  Build status also if there are spaces before and after the slug repository name', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status       fakeuser/fake-project3   '
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status was *unknown* a few seconds ago \n *Commit* : <https://github.com/fakeuser/fake-project3/commit/6aace211abf84f16d74f195109bc91433dc437f4|Link github>fake-commit-message');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.infoColor);
            expect(JSON.stringify(this.fields[0])).to.be.equal('{"title":"Elapsed time","value":"52 sec","short":true}');
            expect(JSON.stringify(this.fields[1])).to.be.equal('{"title":"Build Number","value":' +
                '"<https://travis-ci.org/fakeuser/fake-project3/builds/120506232|Build #37>","short":true}');
            expect(this.title_link).to.be.equal('https://travis-ci.org/fakeuser/fake-project3/builds/120506232');
            done();
        }, 50);

    });

    it('should the bot respond with the  Build status also if the slug is not complete', function (done) {
        this.slackMessageInterface.bot.emit('message', {
            username: 'Sonikku',
            user: 'C3P0',
            channel: 'fake-general-channel-id',
            type: 'message',
            text: '<@' + this.slackMessageInterface.bot.self.id + '>: status fake-project2'
        });

        setTimeout(()=> {
            expect(this.textCheck).to.be.equal('Hi <@C3P0> the build Status was *failed* a few seconds ago \n *Commit* : <https://github.com/fakeuser/fake-project2/commit/6aace211abf84f16d74f195109bc91433dc437f4|Link github>fake-commit-message');// jscs:ignore maximumLineLength
            expect(this.colorMessage).to.be.equal(this.slackMessageInterface.failColor);
            expect(JSON.stringify(this.fields[0])).to.be.equal('{"title":"Elapsed time","value":"52 sec","short":true}');
            expect(JSON.stringify(this.fields[1])).to.be.equal('{"title":"Build Number","value":' +
                '"<https://travis-ci.org/fakeuser/fake-project2/builds/120506232|Build #37>","short":true}');
            expect(this.title_link).to.be.equal('https://travis-ci.org/fakeuser/fake-project2/builds/120506232');
            done();
        }, 50);

    });
});
