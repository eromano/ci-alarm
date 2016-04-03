'use strict';

var Bot = require('slackbots');

class slackMessageInterface {

    get successColor() {
        return 'good';
    }

    get failColor() {
        return 'danger';
    }

    get infoColor() {
        return 'warning';
    }

    constructor(token, idBotCi) {
        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.buildStatus = {message: 'Unknown', color: this.infoColor};
        this.ciBotId = idBotCi;
    }

    run() {
        this.startChannelMessage();
        this.listenerRequestStatusBuild();
        this.listenerCiChangeStatusMessageBuild();
    }

    startChannelMessage() {
        this.bot.on('start', (function () {
            var params = {
                icon_emoji: ':robot_face:',
                attachments: [
                    {
                        'fallback': 'Ci Alarm Bot is here',
                        'color': this.infoColor,
                        'author_name': 'Ci Alarm',
                        'author_link': 'https://github.com/eromano/ci-alarm',
                        'text': 'Keep calm I am the alarm!'
                    }
                ]
            };

            this.bot.postMessageToChannel('general', '', params);
        }).bind(this));
    }

    listenerCiChangeStatusMessageBuild() {
        this.bot.on('message', (function (message) {
            if (this.isFromCiSlackBot(message)) {
                if (this.isFailingMessage(message)) {
                    this.buildStatus = {message: 'Failed', color: this.failColor};
                } else if (this.isSuccessMessage(message)) {
                    this.buildStatus = {message: 'Success', color: this.successColor};
                }
            }

        }).bind(this));
    }

    listenerRequestStatusBuild() {
        this.bot.on('message', (function (message) {
            //console.log(message);
            if (!this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) &&
                this.isMentioningCiAlarm(message) && this.isStatusRequest(message)) {
                var params = {
                    icon_emoji: ':robot_face:',
                    attachments: [
                        {
                            'fallback': 'Ci status',
                            'color': this.buildStatus.color,
                            'author_name': 'Ci Alarm',
                            'author_link': 'https://github.com/eromano/ci-alarm',
                            'text': 'Hi <@' + message.user + '> the build Status is ' + this.buildStatus.message + '!'
                        }
                    ]
                };
                this.bot.postMessageToChannel('general', '', params);
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

    isFromCiSlackBot(message) {
        return this.ciBotId === message.bot_id;
    }

    isStatusRequest(message) {
        return message.text && message.text.indexOf('status') > -1;
    }

    isFailingMessage(message) {
        return message.attachments[0].text.indexOf('failed') > -1;
    }

    isSuccessMessage(message) {
        return message.attachments[0].text.indexOf('passed') > -1;
    }
}

module.exports = slackMessageInterface;
