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

    constructor(token, ciService) {
        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.ciService = ciService;
    }

    run() {
        this.startChannelMessage();
        this.listenerRequestStatusBuild();
        this.listenerRepositoryListMessage();
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

    listenerRequestStatusBuild() {
        this.bot.on('message', ((message) => {
            if (!this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) &&
                this.isMentioningCiAlarm(message) && this.isStatusRequest(message)) {
                var repoName = this.getRepositoriesNameInMessage(message);

                if (repoName) {
                    this.ciService.getLastBuildStatusByRepository(repoName).then((statusBuild)=> {
                        this.postSlackMessageToChannel('Hi <@' + message.user + '> the build Status is ' + statusBuild + '!', 'Ci status', this.colorByStatus(statusBuild));
                    },(error)=> {
                        this.postSlackMessageToChannel(error.toString(), 'Ci status', this.failColor);
                    });
                }else {
                    this.postSlackMessageToChannel('Maybe you want use the command : "status username/example-project" but you forgot to add the repository slug', 'Ci status', this.infoColor);// jscs:ignore maximumLineLength
                }
            }
        }));
    }

    listenerRepositoryListMessage() {
        this.bot.on('message', ((message) => {
            if (!this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) &&
                this.isMentioningCiAlarm(message) && this.isListRepositoryRequest(message)) {

                this.ciService.getUserRepositoriesSlugList().then((repositories)=> {
                    this.postSlackMessageToChannel('Hi <@' + message.user + '> this is the repository list: \n • ' +
                        repositories.join('\n• ') + 'Repository list', this.infoColor);
                });
            }
        }));
    }

    /**
     * Post a message in the slack general chat
     *
     * @param {String} message
     * @param {String} fallback
     * @param {successColor|failColor|infoColor} color of the vertical line before the message default infoColor yellow
     */
    postSlackMessageToChannel(message, fallback, color) {
        var params = {
            icon_emoji: ':robot_face:',
            attachments: [
                {
                    'fallback': fallback,
                    'color': color || this.infoColor,
                    'author_name': 'Ci Alarm',
                    'author_link': 'https://github.com/eromano/ci-alarm',
                    'text': message
                }
            ]
        };
        this.bot.postMessageToChannel('general', '', params);
    }

    isFromCiAlarmBotMessage(message) {
        return message.hasOwnProperty('username') && (message.username === this.bot.name);
    }

    getRepositoriesNameInMessage(message) {
        var statusPos = message.text.toLowerCase().indexOf('status');
        var afterStatus = message.text.toLowerCase().substr(statusPos + 6,message.length);
        var allPhrasesSeparateBySpace = afterStatus.split(' ');
        if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 1) {
            return allPhrasesSeparateBySpace[1].trim();
        }
    }

    isChatMessage(message) {
        return message.type === 'message' && Boolean(message.text);
    }

    isMentioningCiAlarm(message) {
        return message.text && message.text.indexOf(this.bot.self.id) > -1;
    }

    isListRepositoryRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('repository list') > -1;
    }

    isStatusRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('status') > -1;
    }

    colorByStatus(status) {
        var color;
        if (status === 'passed') {
            color = this.successColor;
        } else if (status === 'failed') {
            color = this.failColor;
        } else {
            color = this.infoColor;
        }
        return color;
    }
}

module.exports = slackMessageInterface;
