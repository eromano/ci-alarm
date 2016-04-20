'use strict';

var RaspberryInterface = require('./raspberryInterface');
var TravisService = require('./travisService');
var SlackMessageInterface = require('./slackMessageInterface');
var assert = require('assert');

class CiAlarmBot {

    /**
     * @param {String} slackToken Your Slack bot integration token (obtainable at https://my.slack.com/services/new/bot)
     * @param {String} githubToken  Your Git hub private token bot integration token (obtainable at https://github.com/settings/tokens) scope needed repo and user
     */
    constructor(slackToken, githubToken) {
        assert(slackToken, 'Slack Token is necessary');
        assert(githubToken, 'GithubToken is necessary');

        this.raspberryInterface = new RaspberryInterface();
        this.travisService = new TravisService(githubToken);

        this.travisService.on('travis:login:ok', ()=> {
            this.run(slackToken);
            console.log('Keep calm ci aarm is up and running');
        });

        this.travisService.on('travis:login:error', (error)=> {
            console.log(error);
        });
    }

    run(slackToken) {
        this.slackMessageInterface = new SlackMessageInterface(slackToken, this.travisService);
        this.slackMessageInterface.run();
    }
}

module.exports = CiAlarmBot;
