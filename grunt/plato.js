'use strict';
/**
 * @see https://github.com/jsoverson/grunt-plato
 */
module.exports = function(alarm, grunt) {
    return {
        dev: {
            options: {
                jshint: grunt.file.readJSON('.jshintrc')
            },
            files: {
                'reports': ['src/**/*.js']
            }
        }
    };
};
