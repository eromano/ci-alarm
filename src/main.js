'use strict';

var http = require('http');
var CiAlarmBot = require('./ciAlarmBot');
var nconf = require('nconf');

nconf.add('config', {type: 'file', file: './config.json'});

try {
    var tokenSlack = process.env.TOKEN_SLACK || nconf.get('tokenslack');
    var githubToken = process.env.TOKEN_GITHUB || nconf.get('githubtoken');

    new CiAlarmBot(tokenSlack, githubToken);
} catch (error) {
    console.log('Bot failed' + error);
}

var server = http.createServer();
server.listen(process.env.PORT || 1337);
