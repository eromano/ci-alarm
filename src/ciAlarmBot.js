'use strict';

var RaspberryInterface = require('./raspberryInterface');
var TravisService = require('./travisService');
var SlackMessageInterface = require('./slackMessageInterface');
var assert = require('assert');

class CiAlarmBot {

    constructor(token, githubToken, gpioPin) {
        assert(token, 'Slack Tocken is necessary');
        assert(githubToken, 'GithubToken is necessary');

        this.gpioPin = !gpioPin ? 22 : gpioPin;

        this.raspberryInterface = new RaspberryInterface(this.gpioPin);
        this.travisService = new TravisService(githubToken);

        this.travisService.on('travis:login:ok', ()=> {
            this.run(token);
        });
    }

    run(token) {
        this.slackMessageInterface = new SlackMessageInterface(token, this.travisService);
        this.slackMessageInterface.run();

        this.travisService.getUserRepositoriesSlugList().then((res)=> {
            this.slackMessageInterface.postSlackMessageToChannel(res.repos[0].id, '');
        });

    }
}

module.exports = CiAlarmBot;
