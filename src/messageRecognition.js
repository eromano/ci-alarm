'use strict';

var Bot = require('slackbots');
var moment = require('moment');

class messageRecognition {

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

        this.listner = [
            this.startChannelMessage,
            this.listenerRequestStatusBuild,
            this.listenerRepositoryListMessage,
            this.listenerCommandListMessage,
            this.listenerRebuildMessage
        ];

        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.ciService = ciService;
    }

    run() {
        this.startListener();
    }

    startListener() {
        while (this.listner.length) {
            this.listner.shift().call(this);
        }
    }

    /**
     * Post a message in any channel where the bot is present at Start
     */
    startChannelMessage() {
        this.bot.on('start', (()=> {
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
            var allJoinedChannelsByUserId = this._getAllJoinedChannelsByUserId(this.bot.self.id);

            if (allJoinedChannelsByUserId) {
                allJoinedChannelsByUserId.forEach((channel)=> {
                    this.bot.postTo(channel, '', params);
                });
            }
        }));
    }

    /**
     * Post a message on slack chat with the status of the last build of a asked repository example: "status ci-alarm"
     */
    listenerRequestStatusBuild() {
        this._listenerMessage(this.isStatusMessage, (message) => {
            var repoName = this._getRepositoriesNameInMessageFrom(message, 'status');
            if (repoName) {
                this.ciService.getLastBuildStatusByRepository(repoName).then((repository)=> {
                    var fields = this._createFieldsAdditionInformationMessage(repository);
                    var lastBuildState = repository.last_build_state ? repository.last_build_state : 'unknown';
                    var nameChannelOrUser = this._getSlackNameById(message).name;

                    this.ciService.getCommitInfoByBuildNumber(repository.last_build_id).then((commit)=> {

                        var commitLink = this.ciService.getCommitLink(commit, repository.slug);
                        this.postSlackMessage('Hi <@' + message.user + '> the build Status was *' + lastBuildState + '* ' + moment(repository.last_build_finished_at).fromNow() + ' \n *Commit* : <' + commitLink + '|Link github>' + commit.message, // jscs:ignore maximumLineLength
                            'Ci status', this._colorByStatus(lastBuildState), fields, 'Build status', repository.linkBuild, nameChannelOrUser);
                    });
                }, (error)=> {
                    this.postSlackMessage(error.toString(), 'Ci status', this.failColor, null, 'Build status');
                });
            } else {
                this.postSlackMessage('Maybe you want use the command : "status username/example-project" but' +
                    ' you forgot to add the repository slug', 'Ci status', this.infoColor, null, 'Build status');
            }
        });
    }

    /**
     * Post a message on slack with the list of all the repositories slug when the bot is asked about it
     */
    listenerRepositoryListMessage() {
        this._listenerMessage(this.isRepositoryListMessage, (message) => {

            this.ciService.getUserRepositoriesSlugList().then((repositories)=> {
                var nameChannelOrUser = this._getSlackNameById(message).name;
                this.postSlackMessage('Hi <@' + message.user + '> this is the repository list: \n • ' + repositories.join('\n• '), 'Repository list',
                    this.infoColor, null, 'Repositories list', '', nameChannelOrUser);
            });

        });
    }

    /**
     * Post a message on slack with the command list when the bot is asked about it
     */
    listenerCommandListMessage() {
        this._listenerMessage(this.isCommandListMessage, (message) => {
            var nameChannelOrUser = this._getSlackNameById(message).name;

            this.postSlackMessage('Hi <@' + message.user + '> this is the command list \n • status username/example-project  \n • repository list \n • command list \n • [build|rebuild] username/example-project', 'Command list', // jscs:ignore maximumLineLength
                this.infoColor, null, 'Command list', '', nameChannelOrUser);
        });
    }

    /**
     * Rebuild the last build with the command rebuild slug repository to rebuild
     */
    listenerRebuildMessage() {
        this._listenerMessage(this.isRebuildMessage, (message) => {
            var repoName = this._getRepositoriesNameInMessageFrom(message, 'build');
            var nameChannelOrUser = this._getSlackNameById(message).name;

            if (repoName) {
                this.ciService.restartLastBuild(repoName).then(()=> {
                    this.postSlackMessage('Build is Running', 'Execute build',
                        this.infoColor, null, 'Execute build', '', nameChannelOrUser);
                }, ()=> {
                    this.postSlackMessage('This repositories doesn\'t exist', 'Execute build',
                        this.infoColor, null, 'Execute build', '', nameChannelOrUser);
                });
            } else {
                this.postSlackMessage('Maybe you want use the command : "build username/example-project" but' +
                    ' you forgot to add the repository slug', 'Execute build', this.infoColor, null, 'Execute build');

            }
        });
    }

    /**
     * Post a message in the slack general chat
     *
     * @param {String} message
     * @param {String} fallback
     * @param {successColor|failColor|infoColor} color of the vertical line before the message default infoColor yellow
     * @param {Array} fields is an Array of messages  { 'title': 'Project', 'value': 'Awesome Project','short': true},
     * @param {String} title title message,
     * @param {String} titleLink link message
     * @param {String} nameChannelOrUser where posts a message  channel | group | user by name,
     */
    postSlackMessage(message, fallback, color, fields, title, titleLink, nameChannelOrUser) {
        var params = {
            icon_emoji: ':robot_face:',
            attachments: [
                {
                    'fallback': fallback,
                    'color': color || this.infoColor,
                    'title': title ? title : 'Ci Alarm',
                    'title_link': titleLink,
                    'text': message,
                    'fields': fields,
                    'mrkdwn_in': ['text', 'pretext']
                }
            ]
        };

        this.bot.postTo(nameChannelOrUser, '', params);
    }

    /**
     * Get the repository name in a message String
     *
     * @param {String} message like 'statsu eromano/ci-alarm'
     * @param {String} wordBeforeNameRepo the string before the name of the repository'
     *
     * @return {String} return the repository name in a message string
     */
    _getRepositoriesNameInMessageFrom(message, wordBeforeNameRepo) {
        var statusPos = message.text.toLowerCase().indexOf(wordBeforeNameRepo);
        var afterStatus = message.text.toLowerCase().substr(statusPos + 6, message.length).trim();

        var allPhrasesSeparateBySpace = afterStatus.split(' ');

        if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 0) {
            return allPhrasesSeparateBySpace[0].trim();
        }
    }

    /**
     * Create additionl field for the slack message
     *
     * @param {Object} repository
     *
     * @return {Array} Array of slack fields
     */
    _createFieldsAdditionInformationMessage(repository) {
        return [
            {'title': 'Elapsed time', 'value': (repository.last_build_duration + ' sec'), 'short': true},
            {
                'title': 'Build Number',
                'value': ('<' + repository.linkBuild + '|Build #' + repository.last_build_number + '>'),
                'short': true
            }
        ];
    }

    /**
     * Get the message channel Name or user Name by ID
     *
     * @param {String} message slack message
     *
     * @return {name} name of the channel or the user in the message depend if is a direct message or channel message
     */
    _getSlackNameById(message) {
        var name = this.bot.channels.find(function (item) {
            return item.id === message.channel;
        });

        if (!name && this.bot.users) {
            name = this.bot.users.find(function (item) {
                return item.id === message.user;
            });
        }
        return name;
    }

    /**
     * Get all the channel where a user is member
     *
     * @param {String} userId
     *
     * @return {Array} Array of all the channels where the user is member
     */
    _getAllJoinedChannelsByUserId(userId) {
        var userChannels = [];

        this.bot.channels.forEach((channel)=> {
            if (channel.members) {
                var member = channel.members.find((member)=> {
                    return member === userId;
                });
                if (member) {
                    userChannels.push(channel.name);
                }
            }
        });

        return userChannels;
    }

    _colorByStatus(status) {
        var color = this.infoColor;

        if (status === 'passed') {
            color = this.successColor;
        } else if (status === 'failed') {
            color = this.failColor;
        }

        return color;
    }

    _listenerMessage(condition, callback) {
        this.bot.on('message', (message) => {
            if (condition.call(this, message)) {
                callback.call(this, message);
            }
        });
    }

    isRebuildMessage(message) {
        return this.isValidCiMentionMessage(message) && this.isRebuildRequest(message);
    }

    isRepositoryListMessage(message) {
        return this.isValidCiMentionMessage(message) && this.isListRepositoryRequest(message);
    }

    isCommandListMessage(message) {
        return this.isValidCiMentionMessage(message) && this.isCommandListRequest(message);
    }

    isStatusMessage(message) {
        return this.isValidCiMentionMessage(message) && this.isStatusRequest(message);
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

    isListRepositoryRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('repository list') > -1;
    }

    isStatusRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('status') > -1;
    }

    isRebuildRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('build') > -1;
    }

    isCommandListRequest(message) {
        return message.text && message.text.toLowerCase().indexOf('command list') > -1;
    }

    isValidCiMentionMessage(message) {
        return !this.isFromCiAlarmBotMessage(message) && this.isChatMessage(message) && this.isMentioningCiAlarm(message);
    }
}

module.exports = messageRecognition;
