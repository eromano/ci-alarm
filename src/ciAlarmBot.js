'use strict';

var RaspberryInterface = require('./raspberryInterface');
var TravisService = require('./travisService');
var SlackMessageInterface = require('./slackMessageInterface');
var assert = require('assert');
var TravisHook = require('./travisHook');

class CiAlarmBot {

    /**
     * @param {String} slackToken Your Slack bot integration token (obtainable at https://my.slack.com/services/new/bot)
     * @param {String} githubToken  Your Git hub private token bot integration token (obtainable at https://github.com/settings/tokens) scope needed repo and user
     * @param {String} travisToken  Your Travis token (obtainable at https://travis-ci.org/profile/{your_username})
     */
    constructor(slackToken, githubToken, travisToken) {
        assert(slackToken, 'Slack Token is necessary');
        assert(githubToken, 'GitHub Token is necessary');

        this.raspberryInterface = new RaspberryInterface();
        this.travisService = new TravisService(githubToken);

        this.travisService.on('travis:login:ok', ()=> {
            this.run(slackToken, travisToken);
            console.log('Keep calm ci alarm is up and running');
        });

        this.travisService.on('travis:login:error', (error)=> {
            console.log(error);
        });
    }

    run(slackToken, travisToken) {
        this.slackMessageInterface = new SlackMessageInterface(slackToken, this.travisService);
        this.slackMessageInterface.run();

        new TravisHook(this.slackMessageInterface, travisToken);
    }
}

module.exports = CiAlarmBot;
