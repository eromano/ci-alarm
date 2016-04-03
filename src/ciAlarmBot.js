'use strict';

var RaspberryInterface = require('./raspberryInterface');
var TravisInterface = require('./travisInterface');
var SlackMessageInterface = require('./slackMessageInterface');

class CiAlarmBot {

    constructor(token, idBotCi, githubToken, gpioPin) {
        if (!token || !idBotCi || !githubToken) {
            console.log('Slack Tocken , Id Bot CI, githubToken are necessary');
        }
        this.gpioPin = !gpioPin ? 22 : gpioPin;

        this.buildStatus = {message: 'Unknown', color: this.infoColor};
        this.ciBotId = idBotCi;

        this.raspberryInterface = new RaspberryInterface(this.gpioPin);
        this.travisInterface = new TravisInterface(githubToken);
        this.slackMessageInterface = new SlackMessageInterface(token, idBotCi);
        this.slackMessageInterface.run();
    }
}

module.exports = CiAlarmBot;
