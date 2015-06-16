/**
 * Created by flexalex on 5/4/15.
 */
/***
* Main entry point for the child porcess
**/
(function () {
    'use strict';
    var utils = require('./helpers');
    var jobs = utils.jobs;

    process.on('message', function (data) {
        try {
            var jobMethod = jobs[data.job.name];
            if (!jobMethod) {
                utils.logMessage('error', 'Job with the name: ' + data.job.name + ' does not exist');
                return utils.sendError(data, 'Job with the name: ' + data.job.name + ' does not exist');
            }
            return processJob(jobMethod, data);
        } catch (err) {
            utils.sendError(data.job, err.message + ' trace: ' + JSON.stringify(err.stack));
        }
    });

    /***
     * Starts processing the job
     * @param method
     * @param data
     */
    function processJob (method, data) {
        var job = data.job;
        method.call(null, job, function (err, result) {
            if (err) {
                utils.sendError(data, err.message);
            } else {
                var response = {};
                response.callbackId = data.callbackId;
                response.result = result;
                utils.sendSuccess(response);
            }
        });
    }
})();
