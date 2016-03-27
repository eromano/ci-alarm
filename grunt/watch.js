'use strict';
/**
 * @see https://github.com/gruntjs/grunt-contrib-watch
 */
module.exports = function(alarm) {
    return {
        scripts: {
            expand: true,
            files: [
                'src/**/*.js'
            ],
            tasks: ['jshint'],
            options: {
                spawn: false,
                event: ['changed'],
                livereload: alarm.livereloadPort
            }
        }
    };
};
