'use strict';
/**
 * @see https://github.com/gruntjs/grunt-contrib-connect
 */
module.exports = function(alarm) {
    return {
        test: {
            options: {
                port: alarm.connectPortTest,
                livereload: alarm.livereloadPort,
                base: [
                    'test',
                    'node_modules',
                    'app'
                ]
            }
        },
        complex: {
            options: {
                port: alarm.connectPortTest,
                livereload: alarm.livereloadPort,
                base: [
                    'test',
                    'node_modules',
                    'reports'
                ]
            }
        }
    };
};
