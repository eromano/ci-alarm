'use strict';

var Bot = require('slackbots');

class CiAlarmBot {

    constructor(token) {
        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.buildStatus = 'Unknown';
    }

    run() {
        this.startChannelMessage();
        this.listenerRequestStatusBuild();
    }

    startChannelMessage() {
        this.bot.on('start', (function () {
            var params = {
                icon_emoji: ':robot_face:'
            };

            this.bot.postMessageToChannel('general', 'Keep calm I am the alarm!', params);
        }).bind(this));
    }

    listenerRequestStatusBuild() {
        this.bot.on('message', (function (message) {
            if (!this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) && this.isMentioningCiAlarm(message)) {
                var params = {
                    icon_emoji: ':robot_face:'
                };

                this.bot.postMessageToChannel('general', 'Build Status is ' + this.buildStatus + '!', params);
            }
        }).bind(this));
    }

    isFromCiAlarmBotMessage(message) {
        return message.hasOwnProperty('username') && (message.username === this.bot.name);
    }

    isChatMessage(message) {
        return message.type === 'message' && Boolean(message.text);
    }

    isMentioningCiAlarm(message) {
        return message.text && message.text.indexOf(this.bot.self.id) > -1;
    }
}

module.exports = CiAlarmBot;
