'use strict';

var http = require('http');
var CiAlarmBot = require('./ciAlarmBot');
var nconf = require('nconf');

nconf.add('config', {type: 'file', file: './config.json'});

try {
    var tokenSlack =  nconf.get('tokenslack');
    var ciBotId =  nconf.get('cibotid');

    var ciAlarmBot = new CiAlarmBot(tokenSlack, ciBotId);
    ciAlarmBot.run();
} catch (error) {
    console.log('Bot failed' + error);
}

var server = http.createServer();
server.listen(1337, '127.0.0.1');
