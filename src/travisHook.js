'use strict';
var http = require('http');
var createHandler = require('travisci-webhook-handler');
var assert = require('assert');

class travisHook {

    /**
     * @param {Object} slackMessageInterface
     * @param {String} travisToken  Your Travis token (obtainable at https://travis-ci.org/profile/{your_username})
     */
    constructor(slackMessageInterface, travisToken) {
        assert(travisToken, 'Travis Token is necessary');

        this.handler = createHandler({path: '/', token: travisToken});

        this._instantiateHandler();
        this._startListener(slackMessageInterface);
    }

    _instantiateHandler() {
        http.createServer((req, res) => {
            this.handler(req, res, (err) => {
                console.log('Error handler', err);
                res.end('Error handler ' + err);
            });
        }).listen(process.env.PORT || 1337);
    }

    _startListener(slackMessageInterface) {
        this.handler.on('error', function (err) {
            console.error('Error:', err.message);
        });

        this.handler.on('success', function (event) {
            slackMessageInterface.postSlackMessageFromHook(event.payload);

            console.log('Build %s success for %s branch %s',
                event.payload.number,
                event.payload.repository.name,
                event.payload.branch);
        });

        this.handler.on('failure', function () {
            console.log('Build failed!');
        });

        this.handler.on('start', function () {
            console.log('Build started!');
        });
    }
}

module.exports = travisHook;
