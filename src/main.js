'use strict';

var http = require('http');
var CiAlarmBot = require('./ciAlarmBot');

try {
    var tokenSlack = 'xoxb-29668671042-C7DrFWDtX7RBOpHf2KaUecE3';
    var ciBotId = 'B0W93JU9Y';

    var ciAlarmBot = new CiAlarmBot(tokenSlack, ciBotId);
    ciAlarmBot.run();
} catch (error) {
    console.log('Bot failed' + error);
}

var server = http.createServer();
server.listen(1337, '127.0.0.1');
