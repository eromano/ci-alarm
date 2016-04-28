'use strict';

var createHandler = require('travisci-webhook-handler');
var assert = require('assert');
var nconf = require('nconf');

class travisHook {

    /**
     * @param {Object} req
     * @param {Object} res
     * @param {Object} slackMessageInterface
     */
    constructor(req, res, slackMessageInterface) {
        var travistoken = process.env.TOKEN_TRAVIS || nconf.get('travistoken');

        assert(travistoken, 'Travis Token is necessary');

        this.handler = createHandler({path: '/', token: travistoken});

        this._instantiateHandler(req, res, slackMessageInterface);
    }

    _instantiateHandler(req, res, slackMessageInterface){
        this.handler(req, res, (err) => {
            console.log('Error handler', err);
            res.end('Error handler ' + err);
        });

        this.handler.on('error', function (err) {
            console.error('Error:', err.message);
        });

        this.handler.on('success', function (event) {
            console.log(event.payload);

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
