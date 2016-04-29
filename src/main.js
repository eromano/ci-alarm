var CiAlarmBot = require('./ciAlarmBot');
var nconf = require('nconf');

nconf.add('config', {type: 'file', file: './config.json'});

try {
    var tokenSlack = process.env.TOKEN_SLACK || nconf.get('tokenslack');
    var githubToken = process.env.TOKEN_GITHUB || nconf.get('githubtoken');
    var travisToken = process.env.TOKEN_TRAVIS || nconf.get('travistoken');

    new CiAlarmBot(tokenSlack, githubToken, travisToken);
} catch (error) {
    console.log('Bot failed' + error);
}
