'use strict';
var assert = require('assert');

class slackMessageAnalyze {

    constructor(bot) {
        assert(bot, 'Slack bot object is necessary');
        this.bot = bot;
    }

    /**
     * Get the repository name in a message String
     *
     * @param {String} textMessage like 'status eromano/ci-alarm'
     * @param {String} wordBeforeNameRepo the string before the name of the repository for example "status"
     *
     * @return {String} return the repository name in a message string
     */
    getRepositoriesNameInMessageFrom(textMessage, wordBeforeNameRepo) {
        var wordPos = textMessage.toLowerCase().indexOf(wordBeforeNameRepo);
        var afterStatus = textMessage.toLowerCase().substr((wordPos + wordBeforeNameRepo.length), textMessage.length).trim();

        var allPhrasesSeparateBySpace = afterStatus.split(' ');

        if (allPhrasesSeparateBySpace && allPhrasesSeparateBySpace.length > 0) {
            return allPhrasesSeparateBySpace[0].trim();
        }
    }

    isRebuildMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContaineidInMessage(textMessage, 'build');
    }

    isRepositoryListMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContaineidInMessage(textMessage, 'repository list');
    }

    isCommandListMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContaineidInMessage(textMessage, 'command list');
    }

    isStatusMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContaineidInMessage(textMessage, 'status');
    }

    isHistoryMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isTextContaineidInMessage(textMessage, 'history');
    }

    _isTextContaineidInMessage(textMessage, textToSearch) {
        return textMessage && textMessage.toLowerCase().indexOf(textToSearch) > -1;
    }

    _isValidCiMentionMessage(textMessage) {
        return !this._isFromCiAlarmBotMessage(textMessage)  && this._isMentioningCiAlarm(textMessage);
    }

    _isMentioningCiAlarm(textMessage) {
        return textMessage && textMessage.indexOf(this.bot.self.id) > -1;
    }

    _isFromCiAlarmBotMessage(textMessage, username) {
        return (username === this.bot.name);
    }
}

module.exports = slackMessageAnalyze;
