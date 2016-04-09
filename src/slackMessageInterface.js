'use strict';

var Bot = require('slackbots');
var moment = require('moment');

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
        this.listenerCommandListMessage();
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
            if (this.isValidCiMentionMessage(message) && this.isStatusRequest(message)) {
                var repoName = this.getRepositoriesNameInMessage(message);

                if (repoName) {
                    this.ciService.getLastBuildStatusByRepository(repoName).then((statusBuild)=> {
                        var fields = this._createFieldsAdditionInformationMessage(statusBuild);
                        var lastBuildState = statusBuild.last_build_state ? statusBuild.last_build_state : 'unknown';

                        this.postSlackMessageToChannel('Hi <@' + message.user + '> the build Status was ' + lastBuildState + ' ' + moment(statusBuild.last_build_finished_at).fromNow(), 'Ci status', this.colorByStatus(lastBuildState), fields, 'Build status', statusBuild.linkBuild); // jscs:ignore maximumLineLength
                    }, (error)=> {
                        this.postSlackMessageToChannel(error.toString(), 'Ci status', this.failColor, null, 'Build status');
                    });
                } else {
                    this.postSlackMessageToChannel('Maybe you want use the command : "status username/example-project" but' +
                        ' you forgot to add the repository slug', 'Ci status', this.infoColor, null, 'Build status');
                }
            }
        }));
    }

    /**
     * Post a message on slack with the list of all the repositories slug when the bot is asked about it
     */
    listenerRepositoryListMessage() {
        this.bot.on('message', ((message) => {
            if (this.isValidCiMentionMessage(message) && this.isListRepositoryRequest(message)) {

                this.ciService.getUserRepositoriesSlugList().then((repositories)=> {
                    this.postSlackMessageToChannel('Hi <@' + message.user + '> this is the repository list: \n • ' +
                        repositories.join('\n• ') + 'Repository list', this.infoColor, null, 'Repositories list');
                });
            }
        }));
    }

    /**
     * Post a message on slack with the command list when the bot is asked about it
     */
    listenerCommandListMessage() {
        this.bot.on('message', ((message) => {
            if (this.isValidCiMentionMessage(message) && this.isCommandListRequest(message)) {
                this.postSlackMessageToChannel('Command list: \n • repository list \n • status username/example-project', this.infoColor, null, 'Repository list');
            }
        }));
    }

    /**
     * Post a message in the slack general chat
     *
     * @param {String} message
     * @param {String} fallback
     * @param {successColor|failColor|infoColor} color of the vertical line before the message default infoColor yellow
     * @param {Array} fields is an Array of messages  { 'title': 'Project', 'value': 'Awesome Project','short': true},
     */
    postSlackMessageToChannel(message, fallback, color, fields, title, titleLink) {
        var params = {
            icon_emoji: ':robot_face:',
            attachments: [
                {
                    'fallback': fallback,
                    'color': color || this.infoColor,
                    'title': title ? title : 'Ci Alarm',
                    'title_link': titleLink,
                    'text': message,
                    'fields': fields
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
        var afterStatus = message.text.toLowerCase().substr(statusPos + 6, message.length).trim();

        var allPhrasesSeparateBySpace = afterStatus.split(' ');

        if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 0) {
            return allPhrasesSeparateBySpace[0].trim();
        }
    }

    _createFieldsAdditionInformationMessage(statusBuild) {
        return [
            {'title': 'Elapsed time', 'value': (statusBuild.last_build_duration + ' sec'), 'short': true},
            {'title': 'Build Number', 'value': ('<' + statusBuild.linkBuild  + '|Build #' + statusBuild.last_build_number + '>'), 'short': true}
        ];
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

    isCommandListRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('command list') > -1;
    }

    isValidCiMentionMessage(message) {
        return !this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) && this.isMentioningCiAlarm(message);
    }

    colorByStatus(status) {
        var color = this.infoColor;

        if (status === 'passed') {
            color = this.successColor;
        } else if (status === 'failed') {
            color = this.failColor;
        }

        return color;
    }
}

module.exports = slackMessageInterface;
