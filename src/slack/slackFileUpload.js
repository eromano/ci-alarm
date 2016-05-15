'use strict';
var assert = require('assert');
var SlackUploader = require('node-slack-upload');
var fs = require('fs');
var path = require('path');

class slackFileUpload {

    /**
     * @param {String} slackToken Your Slack bot integration token (obtainable at https://my.slack.com/services/new/bot)
     */
    constructor(slackToken) {
        assert(slackToken, 'Slack token is necessary');
        this.slackUploader = new SlackUploader(slackToken);
    }

    /**
     * @param {String} fileName to upload with the extension
     * @param {String} initialComment to put at start of the uploaded File
     * @param {String} channel where upload the File
     */
    uploadFile(fileName, initialComment, channel) {
        initialComment = initialComment ? initialComment : '';

        this.slackUploader.uploadFile({
            file: fs.createReadStream(path.join(__dirname, '../..', 'log', fileName)),
            filetype: 'txt',
            title: fileName,
            initialComment: initialComment,
            channels: channel
        }, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log('done');
            }
        });
    }
}

module.exports = slackFileUpload;
