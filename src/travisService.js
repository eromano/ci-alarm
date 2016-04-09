'use strict';
var Travis = require('travis-ci');
var TravisAuth = require('./travisAuth');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var assert = require('assert');

class travisInterface {

    get username() {
        return this._username;
    }

    set username(newUsername) {
        this._username = newUsername;
    }

    constructor(githubToken) {
        assert(githubToken, 'GithubToken is necessary');

        this.githubToken = githubToken;
        this.travis = new Travis({
            version: '2.0.0',
            headers: {
                'User-Agent': 'Travis/1.0'
            }
        });

        this.travisBaseUrl = 'https://travis-ci.org';
        this.travisAuth = new TravisAuth(this.travis, githubToken);
        this.travisAuth.login().then(() => {
            this.getAccountInfo().then(() => {
                this.emit('travis:login:ok');
            }, () => {
                this.emit('travis:login:error');
            });
        });
    }

    /**
     * Retrieve the user Account info in a promise
     */
    getAccountInfo() {
        return new Promise((resolve, reject) => {
            this.travis.accounts.get((err, res) => {
                if (err || !res) {
                    reject(new Error(('Get AccountInfo Error ' + err)));
                }
                this.username = res.accounts[0].login;
                resolve();
            });
        });
    }

    /**
     * Retrieve the user repository List in a promise
     *
     * @return {Promise} A promise that returns the list of the all repositories
     */
    getUserRepositoriesList() {
        return new Promise((resolve, reject) => {
            this.travis.repos(this.username).get(function (err, res) {
                if (err || !res) {
                    reject(new Error(('Get UserRepository Error ' + err)));
                }
                resolve(res.repos);
            });
        });
    }

    /**
     * Retrieve the user repositories slug list  in a promise
     *
     * @return {Promise} A promise that returns the list of the all repositories slug
     */
    getUserRepositoriesSlugList() {
        return new Promise((resolve) => {
            this.getUserRepositoriesList().then((repositoriesList)=> {
                resolve(_.map(repositoriesList, 'slug'));
            });
        });
    }

    /**
     * Retrieve the repository master branch status
     *
     * @param  {String} repositoryName name of the repository which you are interested in
     * @return {Promise} A promise that returns the status of the last build of the repository which you are interested in
     */
    getLastBuildStatusByRepository(repositoryName) {
        return new Promise((resolve, reject) => {

            this.getUserRepositoriesList().then((repositoriesList)=> {

                var repository = _.find(repositoriesList, (repository)=> {
                    if (repository.slug.indexOf(repositoryName) > -1) {
                        return true;
                    }
                });

                if (repository) {
                    this._expandBaseRepositoryTravisObject(repository);
                    resolve(repository);
                } else {
                    reject(new Error(('This repositories dosen\'t exixst')));
                }
            });
        });
    }

    _expandBaseRepositoryTravisObject(repository) {
        repository.linkBuild = this.travisBaseUrl + '/' + repository.slug + '/builds/' + repository.last_build_id;
    }
}

util.inherits(travisInterface, EventEmitter);
module.exports = travisInterface;
