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

        this.travisInterface.on('travis:login:ok', ()=> {
            this.run(token, idBotCi);
        });
    }

    run(token, idBotCi) {
        this.slackMessageInterface = new SlackMessageInterface(token, idBotCi);
        this.slackMessageInterface.run();

        this.travisInterface.getUserRepository().then((res)=> {
            console.log(res.repos[0].id);
            this.slackMessageInterface.postSlackMessageToChannel(res.repos[0].id, '');
        });

    }
}

module.exports = CiAlarmBot;
