'use strict';
/**
 * @see https://github.com/jsoverson/grunt-open
 */
module.exports = function() {
    return {
        coverage: {
            path: 'http://localhost:<%= alarm.connectPortTest %>/test-runner-debug.html'
        },
        plato: {
            path: 'http://localhost:<%= alarm.connectPortTest %>/index.html'
        }
    };
};
