(function () {
    'use strict';

    module.exports = function (job, done) {

        setTimeout(function () {
            done(null, job);
        }, job.block)

    };
})();
