'use strict';

var http = require('http');
var CiAlarmBot = require('./ciAlarmBot');
var nconf = require('nconf');

nconf.add('config', {type: 'file', file: './config.json'});

try {
    var tokenSlack =  nconf.get('tokenslack');
    var ciBotId =  nconf.get('cibotid');
    var githubToken =  nconf.get('githubtoken');

    new CiAlarmBot(tokenSlack, ciBotId, githubToken);
} catch (error) {
    console.log('Bot failed' + error);
}

var server = http.createServer();
server.listen(1337, '127.0.0.1');
