'use strict';

var Bot = require('slackbots');
var moment = require('moment');
var SlackMessageAnalyze = require('./slackMessageAnalyze');
var RaspberryInterface = require('../raspberryInterface');

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
        this.ciService = ciService;

        this.listener = [
            this.startChannelMessage,
            this.listenerRequestStatusBuild,
            this.listenerRepositoryListMessage,
            this.listenerInfoRepository,
            this.listenerCommandListMessage,
            this.listenerRebuildMessage,
            this.listenerBuildsHistory,
            this.listenerReport,
            this.listenerAlarm,
            this.listenerLog
        ];

        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.slackMessageAnalyze = new SlackMessageAnalyze(this.bot);
        this.raspberryInterface = new RaspberryInterface();
    }

    run() {
        this._startListener();
    }

    /**
     * Start all the listener message in the listener array
     */
    _startListener() {
        while (this.listener.length) {
            this.listener.shift().call(this);
        }
    }

    /**
     * Post a message in any channel where the bot is present at Start
     */
    startChannelMessage() {
        this.bot.on('start', (()=> {
            var message = 'Keep calm I am the alarm please think about to add a star to our project ' + this.slackMessageAnalyze.createSlackMessageLink('Ci Alarm', 'https://github.com/eromano/ci-alarm'); // jscs:ignore maximumLineLength
            var fallBack = 'Ci Alarm Bot is here';
            var color = this.infoColor;
            var title = 'Ci Alarm Bot greetings';
            var titleLink = 'https://github.com/eromano/ci-alarm';

            this.postSlackMessageInAllJoinedChannel(message, fallBack, color, null, title, titleLink);
        }));
    }

    /**
     * Post a message on slack chat with the status of the last build of a asked repository example: "status ci-alarm"
     */
    listenerRequestStatusBuild() {
        this._listenerMessage(this.slackMessageAnalyze.isStatusMessage, (message) => {
            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'status');
            if (repoName) {
                this.ciService.getLastBuildStatusByRepository(repoName).then((repository)=> {
                    this.ciService.getCommitInfoByBuildNumber(repository.last_build_id).then((commit)=> {
                        var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;
                        var messageText = this._createMessageBuildInfo(message, repository, commit);
                        var fields = this._createFieldsAdditionInformationMessage(repository, commit);

                        this.postSlackMessage(messageText,
                            'Ci status', this._colorByStatus(this._getBuildStatusByRepo(repository)), fields, 'Build status', repository.linkBuild, nameChannelOrUser);
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
        this._listenerMessage(this.slackMessageAnalyze.isRepositoryListMessage, (message) => {

            this.ciService.getUserRepositoriesSlugList().then((repositories)=> {
                var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;
                this.postSlackMessage('Hi <@' + message.user + '> this is the repository list: \n • ' + repositories.join('\n• '), 'Repository list',
                    this.infoColor, null, 'Repositories list', '', nameChannelOrUser);
            });

        });
    }

    /**
     * Post a message on slack with the command list when the bot is asked about it
     */
    listenerCommandListMessage() {
        this._listenerMessage(this.slackMessageAnalyze.isCommandListMessage, (message) => {
            var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;
            this.postSlackMessage('Hi <@' + message.user + '> ' + this.slackMessageAnalyze.createSlackMessageLink('this is the command list', 'https://github.com/eromano/ci-alarm/wiki/Command-List') + ' \n • status username/example-project  \n • repository list \n • command list \n • [build|rebuild] username/example-project  \n • history username/example-project \n • info username/example-project  \n • report \n • log fake-project 23  \n • alarm on/off', 'Command list', // jscs:ignore maximumLineLength
                this.infoColor, null, 'Command list', '', nameChannelOrUser);
        });
    }

    /**
     * Rebuild the last build with the command rebuild slug repository to rebuild
     */
    listenerRebuildMessage() {
        this._listenerMessage(this.slackMessageAnalyze.isRebuildMessage, (message) => {
            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'build');
            var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

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
     * Post a message on slack with the build history for the asked repository example "history ci-alarm"
     */
    listenerBuildsHistory() {
        this._listenerMessage(this.slackMessageAnalyze.isHistoryMessage, (message) => {
            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'history');
            var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

            if (repoName.indexOf('/') > -1) {
                repoName = repoName.replace((this.ciService.username + '/'), '');
            }
            if (repoName) {
                this.ciService.getAllBuildByRepositoryName(repoName).then((builds)=> {
                    this.postSlackMessage(this._createMessageFromBuildsArray(builds), 'Build History',
                        this.infoColor, null, 'Build History', '', nameChannelOrUser);
                }, ()=> {
                    this.postSlackMessage('This repositories doesn\'t exist', 'Build History',
                        this.infoColor, null, 'Build History', '', nameChannelOrUser);
                });
            } else {
                this.postSlackMessage('Maybe you want use the command : "history username/example-project" but' +
                    ' you forgot to add the repository slug', 'Build History', this.infoColor, null, 'Build History');

            }
        });
    }

    /**
     * Post a message on slack with the information about one repository "info ci-alarm"
     */
    listenerInfoRepository() {
        this._listenerMessage(this.slackMessageAnalyze.isInfoRepoMessage, (message) => {
            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'info');
            var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

            if (repoName.indexOf('/') > -1) {
                repoName = repoName.replace((this.ciService.username + '/'), '');
            }

            if (repoName) {
                this.ciService.getLastBuildStatusByRepository(repoName).then((repository)=> {
                    this.postSlackMessage(this._createMessageFromBuildsRepository(repository), 'Info repository',
                        this.infoColor, null, 'Info repository', '', nameChannelOrUser);
                }, ()=> {
                    this.postSlackMessage('This repositories doesn\'t exist', 'Info repository',
                        this.infoColor, null, 'Info repository', '', nameChannelOrUser);
                });
            } else {
                this.postSlackMessage('Maybe you want use the command : "info username/example-project" but' +
                    ' you forgot to add the repository slug', 'Info repository', this.infoColor, null, 'Info repository');

            }
        });
    }

    /**
     * Post a message on slack with the information about all the repository
     */
    listenerReport() {
        this._listenerMessage(this.slackMessageAnalyze.isReportMessage, (message) => {
            this.ciService.getUserRepositoriesList().then((repositories)=> {
                var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;
                this.postSlackMessage('Report Status:', 'Info repository',
                    this.infoColor, this._createMessageReport(repositories), 'Report Status', '', nameChannelOrUser);
            });
        });
    }

    /**
     * Activate the alarm
     */
    listenerAlarm() {
        this._listenerMessage(this.slackMessageAnalyze.isAlarmMessage, (message) => {
            var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

            var mode = this.slackMessageAnalyze.getTextAfterWord(message.text, 'alarm');
            var validMessage = false;
            if (mode === 'on') {
                this.raspberryInterface.flash();
                validMessage = true;
            } else if (mode === 'off') {
                this.raspberryInterface.stopFlash();
                validMessage = true;
            }

            if (validMessage) {
                this.postSlackMessage('Alarm ' + mode, 'Alarm ' + mode, this.infoColor, null, 'Alarm ' + mode, '', nameChannelOrUser);
            } else {
                this.postSlackMessage('Alarm message not valid type "alarm on OR alarm off"', 'Alarm sugestion', this.infoColor, null, 'Alarm sugestion', '', nameChannelOrUser);
            }
        });
    }

    /**
     * Post a message on slack with the asked log  "log fake-project3 #123"
     */
    listenerLog() {
        this._listenerMessage(this.slackMessageAnalyze.isLogMessage, (message) => {

            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'log');

            if (repoName.indexOf('/') > -1) {
                repoName = repoName.replace((this.ciService.username + '/'), '');
            }

            if (repoName) {
                var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

                this.ciService.getLastBuildStatusByRepository(repoName).then((repository)=> {
                    this.ciService.getBuildInfoByBuildNumber(repository.last_build_id).then((buildInfo)=> {
                        this.ciService.getBuildLog(buildInfo.jobs[0].id).then((log)=> {

                            this.postSlackMessage('```' + log.substr(0, 8000) + '```', 'Log build', this.infoColor, null, 'Log build', '', nameChannelOrUser);
                        });
                    });
                }, ()=> {
                    this.postSlackMessage('This repositories doesn\'t exist', 'Log build',
                        this.infoColor, null, 'Log build', '', nameChannelOrUser);
                });
            } else {
                this.postSlackMessage('Maybe you want use the command : "info username/example-project" but' +
                    ' you forgot to add the repository slug', 'Log build', this.infoColor, null, 'Log build');
            }
        });
    }

    /**
     * create a string from a repositories list whit a general status for any of them
     *
     * @param {Object} repositories list
     */
    _createMessageReport(repositories) {
        var report = [];
        repositories.forEach((repo)=> {

            if (repo.active) {
                var linkBuild = this.slackMessageAnalyze.createSlackMessageLink(('Build #' + repo.last_build_number), repo.linkBuild);

                report.push({
                    'title': repo.slug,
                    'value': '|' + (repo.last_build_number ? linkBuild : '') + '| ' + this._symbolByStatus(repo.last_build_state),
                    'short': false
                });
            }
        });

        return report;
    }

    /**
     * Post a message in every channel where the bot is present
     *
     * @param {Object} hookMessage
     */
    postSlackMessageFromHook(hookMessage) {
        var message = 'Build #' + this.slackMessageAnalyze.createSlackMessageLink('#' + hookMessage.number, hookMessage.build_url) + ' on the project ' + hookMessage.repository.name + ' is ' + this._symbolByStatus(hookMessage.status_message) + ' ' + hookMessage.status_message + ' triggered by ' + hookMessage.committer_name + ' ' + this.slackMessageAnalyze.createSlackMessageLink('Commit', hookMessage.compare_url);// jscs:ignore maximumLineLength
        var fallBack = 'Ci Alarm Build Info';
        var color = this._colorByStatus(hookMessage.status_message);
        var title = 'Ci Alarm Build Info';
        var titleLink = hookMessage.build_url;

        this.postSlackMessageInAllJoinedChannel(message, fallBack, color, null, title, titleLink);
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
     * Post a message in any channel where the bot is present
     *
     * @param {String} message
     * @param {String} fallback
     * @param {successColor|failColor|infoColor} color of the vertical line before the message default infoColor yellow
     * @param {Array} fields is an Array of messages  { 'title': 'Project', 'value': 'Awesome Project','short': true},
     * @param {String} title title message,
     * @param {String} titleLink link message
     * */
    postSlackMessageInAllJoinedChannel(message, fallback, color, fields, title, titleLink) {
        var allJoinedChannelsByUserId = this._getAllJoinedChannelsByUserId(this.bot.self.id);

        if (allJoinedChannelsByUserId) {
            allJoinedChannelsByUserId.forEach((channel)=> {
                this.postSlackMessage(message, fallback, color, fields, title, titleLink, channel);
            });
        }
    }

    /**
     * Create additionl field for the slack message
     *
     * @param {Object} repository
     * @param {Commit} commit
     *
     * @return {Array} Array of slack fields
     */
    _createFieldsAdditionInformationMessage(repository, commit) {
        var fields = [
            {
                'title': 'Elapsed time',
                'value': (repository.last_build_duration + ' sec'),
                'short': true
            }, {
                'title': 'Build Number',
                'value': this.slackMessageAnalyze.createSlackMessageLink(('Build #' + repository.last_build_number), repository.linkBuild),
                'short': true
            }
        ];
        if (repository.last_build_state === 'failed') {
            fields.push({
                'title': 'Possible Failing Guilty',
                'value': commit.committer_name,
                'short': true
            });
        }
        return fields;
    }

    /**
     * Get the message channel Name or user Name by ID
     *
     * @param {String} message slack message
     *
     * @return {name} name of the channel or the user in the message depend if is a direct message or channel message
     */
    _getSlackNameChannelOrUserById(message) {
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

    /**
     * Create Slack Message from builds Array
     *
     * @param {Array} builds
     *
     * @return {String} message
     */
    _createMessageFromBuildsArray(builds) {
        var message = '';
        builds.forEach((buildobject)=> {
            message = message + 'Build #' + buildobject.number + ' was ' + buildobject.state + '\n';
        });

        return message;
    }

    /**
     * Create Slack Message from message and repository for build info
     *
     * @param {Object} message
     * @param {Object} repository
     * @param {Object} commit
     *
     * @return {String} message
     */
    _createMessageBuildInfo(message, repository, commit) {
        var lastBuildState = this._getBuildStatusByRepo(repository);
        var commitLink = this.ciService.getCommitLink(commit, repository.slug);
        var messageWithIssueLink = this.slackMessageAnalyze.replaceIssueNumberWithIssueLink(commit.message, repository.slug);

        return 'Hi <@' + message.user + '> the build Status was *' + lastBuildState + '* ' + moment(repository.last_build_finished_at).fromNow() + ' \n *Commit* : ' + this.slackMessageAnalyze.createSlackMessageLink('Link github', commitLink) + ' ' + messageWithIssueLink; // jscs:ignore maximumLineLength
    }

    _getBuildStatusByRepo(repository) {
        return repository.last_build_state ? repository.last_build_state : 'unknown';
    }

    /**
     * Create Slack Message from repository object
     *
     * @param {Object} repository
     *
     * @return {String} message
     */
    _createMessageFromBuildsRepository(repository) {
        return 'Repository ' + repository.slug + ' status ' + repository.last_build_state + '\n' + repository.description + '\n';
    }

    _colorByStatus(status) {
        var color = this.infoColor;

        if (status.toLowerCase() === 'passed') {
            color = this.successColor;
        } else if (status.toLowerCase() === 'failed') {
            color = this.failColor;
        }

        return color;
    }

    _symbolByStatus(status) {
        var symbol = ':white_medium_square:';
        if (status.toLowerCase() === 'passed') {
            symbol = ':white_check_mark:';
        } else if (status.toLowerCase() === 'failed') {
            symbol = ':warning:';
        }

        return symbol;
    }

    /**
     * Call a callback in the case a message from slack meets the condition
     *
     * @param {Boolean}  condition to meet to call the callback
     * @param {Function} callback to call if the condition is satisfied
     */
    _listenerMessage(condition, callback) {
        this.bot.on('message', (message) => {
            if (condition.call(this.slackMessageAnalyze, message.text, message.username)) {
                callback.call(this, message);
            }
        });
    }
}

module.exports = slackMessageInterface;
