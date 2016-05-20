'use strict';
var assert = require('assert');

class slackMessageAnalyze {

    constructor(bot) {
        assert(bot, 'Slack bot object is necessary');
        this.bot = bot;
    }

    getTextAfterWord(textMessage, wordBefore) {
        return this.getRepositoriesNameInMessageFromText(textMessage, wordBefore);
    }

    /**
     * Get the repository name in a message String
     *
     * @param {String} textMessage like 'status eromano/ci-alarm'
     * @param {String} wordBeforeNameRepo the string before the name of the repository for example "status"
     *
     * @return {String} return the repository name in a message string
     */
    getRepositoriesNameInMessageFromText(textMessage, wordBeforeNameRepo) {
        if (this._isTextContainedInMessage(textMessage, wordBeforeNameRepo)) {
            var wordPos = textMessage.toLowerCase().indexOf(wordBeforeNameRepo);
            var afterStatus = textMessage.toLowerCase().substr((wordPos + wordBeforeNameRepo.length), textMessage.length).trim();

            var allPhrasesSeparateBySpace = afterStatus.split(' ');

            if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 0) {
                return allPhrasesSeparateBySpace[0].trim();
            }
        }
    }

    /**
     * Analyze a message and find inside if is present an issue github number and if is present change the issue number with a link
     *
     * @param {String} textMessage like 'closed #21 Info command about one repository smart version of status'
     * @param {String} slug repository for example
     *
     * @return {String} message with the link
     */
    replaceIssueNumberWithIssueLink(textMessage, slug) {
        if (textMessage && this._isTextContainedInMessage(textMessage, '#')) {
            var hashPosition = textMessage.indexOf('#');
            var afterHash = textMessage.substr(hashPosition + 1, textMessage.length).trim();

            var allPhrasesSeparateBySpace = afterHash.split(' ');

            if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 0) {
                var issueNumber = allPhrasesSeparateBySpace[0].trim();
                var issueNumberLink = this.createSlackMessageLink(('#' + issueNumber), ('https://github.com/eromano/' + slug + '/issues/' + issueNumber));
                return textMessage.replace(('#' + issueNumber), issueNumberLink);
            }
        }
        return textMessage;
    }

    /**
     * Create a slack link format message
     *
     * @param {String} titleLink  text to show instead of the pure URL
     * @param {String} link to redirect
     *
     * @return {String} slack format message link
     */
    createSlackMessageLink(titleLink, link) {
        return '<' + link + '|' + titleLink + '>';
    }

    isRebuildMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'build');
    }

    isLogMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'log');
    }

    isRepositoryListMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'repository list');
    }

    isCommandListMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && (this._isTextContainedInMessage(textMessage, 'command list') || this._isTextContainedInMessage(textMessage, 'help'));// jscs:ignore maximumLineLength
    }

    isStatusMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'status');
    }

    isHistoryMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'history');
    }

    isInfoRepoMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'info');
    }

    isReportMessage(textMessage, username) {
        return this._isValidCiMentionMessage(textMessage, username) && this._isTextContainedInMessage(textMessage, 'report');
    }

    isAlarmMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContainedInMessage(textMessage, 'alarm');
    }

    _isTextContainedInMessage(textMessage, textToSearch) {
        return textMessage && textMessage.toLowerCase().indexOf(textToSearch) > -1;
    }

    _isValidCiMentionMessage(textMessage, username) {
        return (username && !this._isFromCiAlarmBotMessage(textMessage, username)) && this._isMentioningCiAlarm(textMessage);
    }

    _isMentioningCiAlarm(textMessage) {
        return textMessage && textMessage.indexOf(this.bot.self.id) > -1;
    }

    _isFromCiAlarmBotMessage(textMessage, username) {
        return (username === this.bot.self.id);
    }
}

module.exports = slackMessageAnalyze;
