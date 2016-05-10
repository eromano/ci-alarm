'use strict';
var AppVeyor = require('appveyor-js-client');
var assert = require('assert');

class appveyorService {
    constructor(accountName, appveyorToken) {
        assert(appveyorToken, 'Appveyor Token is necessary');
        assert(accountName, 'account name is necessary');

        this.appveyor = new AppVeyor('account-name', 'api-token');

        this.appveyor.getProjects(function(err, projects) {
            console.log(projects);
        });
    }

}

module.exports = appveyorService;
