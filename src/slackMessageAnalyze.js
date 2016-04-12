'use strict';

class slackMessageAnalyze {

    constructor(bot) {
        assert(bot, 'Slack bot object is necessary');
        this.bot = bot;
    }

    isRebuildMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isRebuildRequest(textMessage);
    }

    isRepositoryListMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isListRepositoryRequest(textMessage);
    }

    isCommandListMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isCommandListRequest(textMessage);
    }

    isStatusMessage(textMessage) {
        return this._isValidCiMentionMessage(textMessage) && this._isStatusRequest(textMessage);
    }

     _isListRepositoryRequest(textMessage) {
        return textMessage && textMessage.toLowerCase().indexOf('repository list') > -1;
    }

    _isStatusRequest(textMessage) {
        return textMessage && textMessage.toLowerCase().indexOf('status') > -1;
    }

    _isRebuildRequest(textMessage) {
        return textMessage && textMessage.toLowerCase().indexOf('build') > -1;
    }

    _isCommandListRequest(textMessage) {
        return textMessage && textMessage.toLowerCase().indexOf('command list') > -1;
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
