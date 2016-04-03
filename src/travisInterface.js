'use strict';
var Travis = require('travis-ci');
var TravisAuth = require('./travisAuth');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

class travisInterface {

    get username() {
        return this._username;
    }

    set username(newUsername) {
        this._username = newUsername;
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
            this.getAccountInfo();
        });
    }

    getAccountInfo() {
        return new Promise((resolve, reject) => {
            this.travis.accounts.get((err, res) => {
                if (err || !res) {
                    reject(new Error(('Get AccountInfo Error ' + err)));
                }
                this.username = res.accounts[0].login;
                this.emit('travis:login:ok');
                resolve(res.accounts[0].login);
            });
        });
    }

    getUserRepository() {
        return new Promise((resolve, reject) => {
            this.travis.repos(this.username).get(function (err, res) {
                if (err || !res) {
                    reject(new Error(('Get UserRepository Error ' + err)));
                }
                resolve(res);
            });
        });
    }
}

util.inherits(travisInterface, EventEmitter);
module.exports = travisInterface;
