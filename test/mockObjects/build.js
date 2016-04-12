'use strict';
var _ = require('lodash');

class build {

    static createBuild(attributes) {

        var defaultAttributes = {
            'build': {
                'id': 122131187,
                'repository_id': 8091647,
                'commit_id': 34526630,
                'number': '53',
                'event_type': 'push',
                'pull_request': false,
                'pull_request_title': null,
                'pull_request_number': null,
                'config': {
                    'language': 'node_js',
                    'node_js': [
                        '5.0.0'
                    ],
                    'before_install': 'npm install -g grunt-cli',
                    'install': 'npm install',
                    'sudo': false,
                    'after_success': 'npm run-script coverage',
                    'cache': {
                        'directories': [
                            'node_modules'
                        ]
                    },
                    'notifications': {
                        'slack': 'bottry:qGLlvCPcGHJp6kcmmPuCcHGd'
                    },
                    '.result': 'configured',
                    'group': 'stable',
                    'dist': 'precise'
                },
                'state': 'passed',
                'started_at': '2016-04-10T23:45:53Z',
                'finished_at': '2016-04-10T23:46:44Z',
                'duration': 51,
                'job_ids': [
                    122131188
                ]
            },
            'commit': {
                'id': 34526630,
                'sha': '6aace211abf84f16d74f195109bc91433dc437f4',
                'branch': 'v1.1.0',
                'branch_is_default': false,
                'message': 'fake-commit-message',
                'committed_at': '2016-04-10T23:44:29Z',
                'author_name': 'Eugenio Romano',
                'author_email': 'eugenio.romano@alfresco.com',
                'committer_name': 'Eugenio Romano',
                'committer_email': 'eugenio.romano@alfresco.com',
                'compare_url': 'https://github.com/eromano/ci-alarm/compare/v1.1.0'
            },
            'jobs': [
                {
                    'id': 122131188,
                    'repository_id': 8091647,
                    'build_id': 122131187,
                    'commit_id': 34526630,
                    'log_id': 88293455,
                    'state': 'passed',
                    'number': '53.1',
                    'config': {
                        'language': 'node_js',
                        'node_js': '5.0.0',
                        'before_install': 'npm install -g grunt-cli',
                        'install': 'npm install',
                        'sudo': false,
                        'after_success': 'npm run-script coverage',
                        'cache': {
                            'directories': [
                                'node_modules'
                            ]
                        },
                        'notifications': {
                            'slack': 'bottry:qGLlvCPcGHJp6kcmmPuCcHGd'
                        },
                        '.result': 'configured',
                        'group': 'stable',
                        'dist': 'precise',
                        'os': 'linux'
                    },
                    'started_at': '2016-04-10T23:45:53Z',
                    'finished_at': '2016-04-10T23:46:44Z',
                    'queue': 'builds.docker',
                    'allow_failure': false,
                    'tags': null,
                    'annotation_ids': []
                }
            ],
            'annotations': []

        };

        return _.extend(defaultAttributes, attributes);
    }

    static createBuildsList() {
        return [
            this.createBuild(),
            this.createBuild(),
            this.createBuild()
        ];
    }
}

module.exports = build;
