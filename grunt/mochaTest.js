'use strict';
/**
 * @see https://github.com/pghalliday/grunt-mocha-test
 */
module.exports = function() {
    return {
        test: {
            src: ['test/**/*.js'],
            options: {
                require: ['chai','node_modules/sinon/lib/sinon'],
                log: true,
                logErrors: true,
                reporter: 'Nyan'
            }
        }
    };
};
