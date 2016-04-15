'use strict';
var assert = require('assert');

class travisAuth {

    constructor(travis, githubToken) {
        assert(githubToken, 'githubtoken in config.json is necessary');

        this.githubToken = githubToken;
        this.travis = travis;
    }

    login() {
        return new Promise((resolve, reject) => {
            this.authenticateGitHub().then((res) => {
                this.authenticateTravis(res).then(() => {
                    resolve();
                }, (err) => {
                    reject(err);
                });
            }, (err) => {
                reject(err);
            });
        });
    }

    authenticateGitHub() {
        return new Promise((resolve, reject) => {
            this.travis.auth.github.post({
                github_token: this.githubToken
            }, (err, res) => {
                if (err) {
                    reject(new Error(('Github Access Error ' + err)));
                }
                if (!res || !res.hasOwnProperty('access_token')) {
                    reject(new Error(('Github Access Error access token not returned')));
                }
                resolve(res);
            });
        });
    }

    authenticateTravis(res) {
        return new Promise((resolve, reject) => {
            this.travis.authenticate({
                access_token: res.access_token
            }, (err) => {
                if (err) {
                    reject(new Error(('Travis Access Error ' + err)));
                }
                resolve();
            });
        });
    }

}

module.exports = travisAuth;
