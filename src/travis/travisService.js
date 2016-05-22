'use strict';
var Travis = require('travis-ci');
var TravisAuth = require('./travisAuth');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var assert = require('assert');
var http = require('http');
var fs = require('fs');
var path = require('path');

class travisInterface {

    get username() {
        return this._username;
    }

    set username(newUsername) {
        this._username = newUsername;
    }

    constructor(githubToken) {
        assert(githubToken, 'GithubToken is necessary');

        this.travisBaseUrl = 'https://travis-ci.org';

        this.travis = new Travis({
            version: '2.0.0',
            headers: {
                'User-Agent': 'Travis/1.0'
            }
        });

        this._loginTravis(githubToken);
    }

    /**
     * Login on travis
     *
     * @param {String} githubToken
     */
    _loginTravis(githubToken) {
        this.travisAuth = new TravisAuth(this.travis, githubToken);
        this.travisAuth.login().then(() => {
            this.getAccountInfo().then(() => {
                this.emit('travis:login:ok');
            }, (error) => {
                this.emit('travis:login:error', error);
            });
        }, (error) => {
            this.emit('travis:login:error', error);
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
            this.travis.repos(this.username).get((err, res)=> {
                if (err || !res) {
                    reject(new Error(('Get UserRepository Error ' + err)));
                }

                res.repos.forEach((repository)=> {
                    this._expandBaseRepositoryTravisObject(repository);
                });

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
                    resolve(repository);
                } else {
                    reject(new Error(('This repositories doesn\'t exist')));
                }
            });
        });
    }

    /**
     * Retrieve the commit information by build Number
     *
     * @param  {String} buildId build number
     * @return {Promise} A promise that returns all the commits bounded to the build
     */
    getCommitInfoByBuildNumber(buildId) {
        return new Promise((resolve, reject) => {
            this.getBuildInfoByBuildId(buildId).then((build)=> {
                resolve(build.commit);
            }, (error)=> {
                reject(new Error(error));
            });
        });
    }

    /**
     * Retrieve all the builds master for a project
     *
     * @param  {String} repositoryName name of the repository which you are interested in
     * @return {Promise} A promise that returns all the builds for a Project
     */
    getAllBuildByRepositoryName(repositoryName) {
        return new Promise((resolve, reject) => {
            this.travis.repos(this.username, repositoryName).builds.get(function (err, res) {
                if (err || !res) {
                    reject(new Error(('Get builds Error ' + err)));
                }
                resolve(res.builds);
            });
        });
    }

    /**
     * re-execute last build
     *
     * @param  {String} repositoryName name of the repository which you are interested in
     * @return {Promise} A promise that returns the statusCode
     */
    restartLastBuild(repositoryName) {
        return new Promise((resolve, reject) => {
            this.getLastBuildStatusByRepository(repositoryName).then((repository)=> {
                this.travis.agent.request('POST', '/builds/' + repository.last_build_id + '/restart', null, (response)=> {
                    resolve(200);
                });
            }, (error)=> {
                reject(error);
            });
        });
    }

    /**
     * Retrieve the build information by build Id
     *
     * @param  {String} buildId build Id
     * @return {Promise} A promise that returns all the build info
     */
    getBuildInfoByBuildId(buildId) {
        return new Promise((resolve, reject) => {
            this.travis.builds(buildId).get(function (err, res) {
                if (err || !res) {
                    reject(new Error(('Get Info Build Error ' + err)));
                }
                resolve(res);
            });
        });
    }

    /**
     * Retrieve the build information by build Number
     *
     * @param  {String} buildNumber number of the build
     * @return {Promise} A promise that returns all the build info
     */
    getBuildInfoByBuildNumber(buildNumber, repositoryName) {
        return new Promise((resolve, reject) => {
            this.travis.repos(this.username, repositoryName).builds().get(function (err, res) {
                if (err || !res) {
                    reject(new Error(('Get builds Error ' + err)));
                }
                console.log('res' + JSON.stringify(res));


                var buildObj = _.find(res.builds, (build)=> {
                    if (build.number === buildNumber) {
                        return true;
                    }
                });
                resolve(buildObj);
            });
        });
    }

    /**
     * Retrieve the link to the repo
     *
     * @param  {Object} commit Object
     * @param  {String} slug repository
     *
     * @return {Promise} A promise that returns all the build info
     */
    getCommitLink(commit, slug) {
        return 'https://github.com' + '/' + slug + '/commit/' + commit.sha;
    }

    /**
     * Retrieve the link to the repo
     *
     * @param  {String} jobId id of the build
     *
     * @return {Promise} A promise that returns an Obkect with the buffer string and the fileName
     */
    getBuildLog(jobId) {
        var buffer = '';
        return new Promise((resolve, reject) => {
            var req = http.get(`http://s3.amazonaws.com/archive.travis-ci.org/jobs/${jobId}/log.txt`, (res) => {
                res.on('data', (chunk) => {
                    buffer += chunk.toString();
                });

                res.on('end', () => {
                    var fileName = +jobId + '-log.txt';

                    fs.writeFile(path.join(__dirname, '../..', 'log', fileName), buffer, function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log(jobId + '-log.txt');

                        var log = {
                            buffer: buffer,
                            fileName: fileName
                        };

                        resolve(log);
                    });
                });
            });

            req.on('error', (err) => {
                reject(new Error((`Error during the log collection ${err}`)));
            });
        });
    }

    _expandBaseRepositoryTravisObject(repository) {
        repository.linkBuild = this.buildLinkByLastBuildId(repository.slug, repository.last_build_id);
    }

    buildLinkByLastBuildId(repositorySlug, buildId) {
        return this.travisBaseUrl + '/' + repositorySlug + '/builds/' + buildId;
    }
}

util.inherits(travisInterface, EventEmitter);
module.exports = travisInterface;
