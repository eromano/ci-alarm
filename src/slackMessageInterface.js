'use strict';

var Bot = require('slackbots');
var moment = require('moment');
var SlackMessageAnalyze = require('./slackMessageAnalyze');

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

        this.listner = [
            this.startChannelMessage,
            this.listenerRequestStatusBuild,
            this.listenerRepositoryListMessage,
            this.listenerInfoRepository,
            this.listenerCommandListMessage,
            this.listenerRebuildMessage,
            this.listenerBuildsHistory
        ];

        var settingsBot = {
            token: token,
            name: 'CI Bot Alarm'
        };

        this.bot = new Bot(settingsBot);
        this.slackMessageAnalyze = new SlackMessageAnalyze(this.bot);
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
        this._listenerMessage(this.slackMessageAnalyze.isStatusMessage, (message) => {
            var repoName = this.slackMessageAnalyze.getRepositoriesNameInMessageFromText(message.text, 'status');
            if (repoName) {
                this.ciService.getLastBuildStatusByRepository(repoName).then((repository)=> {
                    this.ciService.getCommitInfoByBuildNumber(repository.last_build_id).then((commit)=> {
                        var fields = this._createFieldsAdditionInformationMessage(repository, commit);
                        var lastBuildState = repository.last_build_state ? repository.last_build_state : 'unknown';
                        var nameChannelOrUser = this._getSlackNameChannelOrUserById(message).name;

                        var commitLink = this.ciService.getCommitLink(commit, repository.slug);
                        var messageWithIssueLink = this.slackMessageAnalyze.replaceIssueNumberWithIssueLink(commit.message , repository.slug);

                        this.postSlackMessage('Hi <@' + message.user + '> the build Status was *' + lastBuildState + '* ' + moment(repository.last_build_finished_at).fromNow() + ' \n *Commit* : ' + this.slackMessageAnalyze.createSlackMessageLink('Link github', commitLink)  + ' ' + messageWithIssueLink, // jscs:ignore maximumLineLength
                            'Ci status', this.colorByStatus(lastBuildState), fields, 'Build status', repository.linkBuild, nameChannelOrUser);
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

            this.postSlackMessage('Hi <@' + message.user + '> ' + this.slackMessageAnalyze.createSlackMessageLink('this is the command list', 'https://github.com/eromano/ci-alarm/wiki/Command-List') + ' \n • status username/example-project  \n • repository list \n • command list \n • [build|rebuild] username/example-project  \n • history username/example-project • info username/example-project', 'Command list', // jscs:ignore maximumLineLength
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
                    this.postSlackMessage(this._createMessageFromBuildsArray(builds) , 'Build History',
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
                    this.postSlackMessage(this._createMessageFromBuildsRepository(repository) , 'Info repository',
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
     * Create additionl field for the slack message
     *
     * @param {Object} repository
     * @param {Commit} commit
     *
     * @return {Array} Array of slack fields
     */
    _createFieldsAdditionInformationMessage(repository, commit) {
        var fields =  [
            {
                'title': 'Elapsed time',
                'value': (repository.last_build_duration + ' sec'),
                'short': true
            }, {
                'title': 'Build Number',
                'value':  this.slackMessageAnalyze.createSlackMessageLink(('Build #' + repository.last_build_number) ,  repository.linkBuild),
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
            message = message + 'Build #' + buildobject.build.number + ' was ' + buildobject.build.state + '\n';
        });

        return message;
    }

    /**
     * Create Slack Message from repository object
     *
     * @param {Object} repository
     *
     * @return {String} message
     */
    _createMessageFromBuildsRepository(repository) {
        return 'Repository ' +  repository.slug  + ' status ' + repository.last_build_state + '\n' + repository.description + '\n';
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

    _listenerMessage(condition, callback) {
        this.bot.on('message', (message) => {
            if (condition.call(this.slackMessageAnalyze, message.text, message.username)) {
                callback.call(this, message);
            }
        });
    }
}

module.exports = slackMessageInterface;
