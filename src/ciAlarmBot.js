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
     * @param {Object} req
     * @param {Object} res
     */
    constructor(slackToken, githubToken, req, res) {
        assert(slackToken, 'Slack Token is necessary');
        assert(githubToken, 'GitHub Token is necessary');

        this.raspberryInterface = new RaspberryInterface();
        this.travisService = new TravisService(githubToken);

        this.travisService.on('travis:login:ok', ()=> {
            this.run(slackToken, req, res);
            console.log('Keep calm ci alarm is up and running');
        });

        this.travisService.on('travis:login:error', (error)=> {
            console.log(error);
        });
    }

    run(slackToken, req, res) {
        this.slackMessageInterface = new SlackMessageInterface(slackToken, this.travisService);
        this.slackMessageInterface.run();

        new TravisHook(req, res, this.slackMessageInterface);
    }
}

module.exports = CiAlarmBot;
