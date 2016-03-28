'use strict';
module.exports = function() {
    return {
        files: 'src/*.js',
        options: {
            lazy: true,
            basePath: 'test'
        }
    };
};
