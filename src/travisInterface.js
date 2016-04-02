'use strict';
var Travis = require('travis-ci');
var TravisAuth = require('./travisAuth');

class travisInterface {

    get account() {
        return this.account;
    }

    set account(account) {
        this.account = account;
    }

    constructor(githubToken) {
        this.githubToken = githubToken;
        this.travis = new Travis({
            version: '2.0.0',
            headers: {
                'User-Agent': 'Travis/1.0'
            }
        });

        this.travisAuth = new TravisAuth(this.travis, githubToken);
        this.travisAuth.login().then(() => {
            console.log('a');
            this.getAccountInfo();
        });
    }

    getAccountInfo() {
        return new Promise((resolve) => {
            this.travis.accounts.get(function (err, res) {
                if (err || !res) {
                    console.log('Get AccountInfo Error ' + err);
                    return;
                }
                resolve(res.accounts[0].login);
            });
        });
    }

    getUserRepository(username) {
        return new Promise((resolve) => {
            this.travis.repos(username).get(function (err, res) {
                resolve(res);
            });
        });
    }
}

module.exports = travisInterface;
