'use strict';

var Bot = require('slackbots');

class CiAlarmBot {

    constructor(token) {
        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
    }

    run() {
        this.startChannelMessage();
    }

    startChannelMessage() {
        this.bot.on('start', (function() {
            var params = {
                icon_emoji: ':robot_face:'  // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
            };

            this.bot.postMessageToChannel('general', 'Keep calm I am the alarm!', params);
        }).bind(this));
    }
}

module.exports = CiAlarmBot;
