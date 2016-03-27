'use strict';

/**
 * @see https://github.com/gruntjs/grunt-contrib-livereload
 */
module.exports = function(alarm) {
    return {
        options: {
            livereload: alarm.livereloadPort
        },
        files: [
            '{.tmp,<%= alarm.app %>}/scripts/{,*/}*.js',
            'test/**/*.js'
        ]
    };
};
