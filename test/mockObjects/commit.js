'use strict';
var _ = require('lodash');

class commit {

    static createCommit(attributes) {

        var defaultAttributes = {
            'id': 1873023,
            'sha': 'a18f211f6f921affd1ecd8c18691b40d9948aae5',
            'branch': 'master',
            'message': 'Merge pull request #25 from henrikhodne/add-responses-to-documentation\n\nAdd responses to documentation',
            'committed_at': '2013-04-15T09:44:31Z',
            'author_name': 'Henrik Hodne',
            'author_email': 'me@henrikhodne.com',
            'committer_name': 'Henrik Hodne',
            'committer_email': 'me@henrikhodne.com',
            'compare_url': 'https://github.com/travis-ci/travis-api/compare/0f31ff4fb6aa...a18f211f6f92'
        };

        return _.merge(defaultAttributes, attributes);
    }

    static createCommitsList() {
        return [
            this.createCommit()
        ];
    }

}

module.exports = commit;
