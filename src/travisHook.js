'use strict';

var createHandler = require('travisci-webhook-handler');
var assert = require('assert');

class travisHook {

    constructor(githubToken, req, res) {
        assert(githubToken, 'GithubToken is necessary');

        var handler = createHandler({path: '/webcomponent-generator-element', token: githubToken});

        handler(req, res, (err) => {
            res.end('Error handler ' + err);
        });

        handler.on('error', function (err) {
            console.error('Error:', err.message);
        });

        handler.on('success', function (event) {
            console.log('Build %s success for %s branch %s',
                event.payload.number,
                event.payload.repository.name,
                event.payload.branch);
        });

        handler.on('failure', function () {
            console.log('Build failed!');
        });

        handler.on('start', function () {
            console.log('Build started!');
        });
    }

}

module.exports = travisHook;
