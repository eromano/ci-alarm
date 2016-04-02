'use strict';
class travisAuth {

    get isAuthenticated() {
        return this.authenticate;
    }

    set isAuthenticated(authenticate) {
        this.authenticate = authenticate;
    }

    constructor(travis, githubToken) {
        this.githubToken = githubToken;
        this.travis = travis;
    }

    login() {
        return new Promise(
            ((resolve) => {
                if (!this.isAuthenticated) {
                    this.authenticateGitHub().then((res) => {
                        this.authenticateTravis(res).then(() => {
                            this.isAuthenticated = true;
                            resolve();
                        });
                    });
                } else {
                    resolve();
                }
            }));
    }

    authenticateGitHub() {
        return new Promise(
            (resolve, reject) => {
                this.travis.auth.github.post({
                    github_token: this.githubToken
                }, (err, res) => {
                    if (err) {
                        reject(new Error(('Github Access Error ' + err)));
                    }
                    resolve(res);
                });
            });
    }

    authenticateTravis(res) {
        return new Promise(
            (resolve, reject) => {
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
