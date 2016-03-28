'use strict';
module.exports = function() {
    return {
        src: 'coverage/**/*.json',
        options: {
            type: 'lcov',
            dir: 'coverage',
            print: 'detail'
        }
    };
};
