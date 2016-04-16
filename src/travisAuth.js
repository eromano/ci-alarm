'use strict';
var assert = require('assert');

class travisAuth {

    /**
     * constructor travisAuth class necessary to login in travis with the githubToken
     *
     * @param  {Object} travisService object
     * @param  {String} githubToken github Personal access token get from the config.json see the readme to understand how to get it
     */
    constructor(travisService, githubToken) {
        assert(travisService, 'Travis service is necessary, instantiate a travis service');
        assert(githubToken, 'githubtoken in config.json is necessary');

        this.githubToken = githubToken;
        this.travis = travisService;
    }

    /**
     * login Travis Service through GitHub Token
     */
    login() {
        return new Promise((resolve, reject) => {
            this._authenticateGitHub().then((res) => {
                this._authenticateTravis(res).then(() => {
                    resolve();
                }, (err) => {
                    reject(err);
                });
            }, (err) => {
                reject(err);
            });
        });
    }

    _authenticateGitHub() {
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

    _authenticateTravis(res) {
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
