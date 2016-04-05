'use strict';

var RaspberryInterface = require('./raspberryInterface');
var TravisService = require('./travisService');
var SlackMessageInterface = require('./slackMessageInterface');
var assert = require('assert');

class CiAlarmBot {

    constructor(token, idBotCi, githubToken, gpioPin) {
        assert(token, 'Slack Tocken is necessary');
        assert(idBotCi, 'Id Bot CI, is necessary');
        assert(githubToken, 'GithubToken is necessary');

        this.gpioPin = !gpioPin ? 22 : gpioPin;

        this.buildStatus = {message: 'Unknown', color: this.infoColor};
        this.ciBotId = idBotCi;

        this.raspberryInterface = new RaspberryInterface(this.gpioPin);
        this.travisService = new TravisService(githubToken);

        this.travisService.on('travis:login:ok', ()=> {
            this.run(token, idBotCi);
        });
    }

    run(token, idBotCi) {
        this.slackMessageInterface = new SlackMessageInterface(token, idBotCi, this.travisService);
        this.slackMessageInterface.run();

        this.travisService.getUserRepository().then((res)=> {
            console.log(res.repos[0].id);
            this.slackMessageInterface.postSlackMessageToChannel(res.repos[0].id, '');
        });

    }
}

module.exports = CiAlarmBot;
