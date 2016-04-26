'use strict';

var http = require('http');
var CiAlarmBot = require('./ciAlarmBot');
var nconf = require('nconf');

nconf.add('config', {type: 'file', file: './config.json'});

http.createServer((req, res) => {

    try {
        var tokenSlack = process.env.TOKEN_SLACK || nconf.get('tokenslack');
        var githubToken = process.env.TOKEN_GITHUB || nconf.get('githubtoken');

        new CiAlarmBot(tokenSlack, githubToken, req, res);
    } catch (error) {
        console.log('Bot failed' + error);
    }
}).listen(process.env.PORT || 1337);
