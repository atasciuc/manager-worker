/**
 * Created by flexalex on 5/5/15.
 */
/***
 * Helpwers for the worker
 **/
(function () {
    'use strict';

    /**
     * @return {{logMessage: logMessage}}
     */
    module.exports =  {
        /***
         * @desc Send a message to the parent thread
         * @type method
         * @name logMessage
         * @param type - message type
         * @param message - the message to send
         */
        logMessage: logMessage,
        /***
         * @desc Holds all the available jobs
         * @type object
         * @name jobs
         */
        jobs: {
            runner: require('../jobs/runner')
        },
        /***
         * @desc Send a message to the parent thread
         * @type method
         * @name sendError
         * @param job - message type
         * @param errorMessage - the error message to send
         */
        sendError: sendError,
        /***
         * @desc Send a message to the parent thread
         * @type method
         * @name sendSuccess
         * @param job send back the job finished
         */
        sendSuccess: sendSuccess,
        /****
         * Executes a query towards the object and
         * deletes the matches
         * not found returns undefined
         * @param queryString   - example user.0.name
         * @param obj       - object to look in
         * @return {*}
         */
        deleteKeyQuery: deleteKeyQuery
    };

    /**
     * Sends a message to the parent thread
     * @param type
     * @param message
     */
    function logMessage (type, message) {
        process.send({
            logger: true,
            type: type,
            message: message
        });
    }

    /***
     * Sends an error result to the parent thread
     * @param job
     * @param errorMessage
     */
    function sendError (job, errorMessage) {
        job.error = errorMessage;
        job.success = false;
        process.send(job);
    }

    /***
     * Send the success to the parent thread
     * @param job
     */
    function sendSuccess (job) {
        job.success = true;
        process.send(job);
    }
    /****
     * Executes a query towards the object and
     * deletes the matches
     * not found returns undefined
     * @param queryString   - example user.0.name
     * @param obj       - object to look in
     * @return {*}
     */
    function deleteKeyQuery (queryString, obj) {
        var elements = queryString.split('.');
        return get(obj, elements);

        function get (objIn, arr) {
            if (arr.length === 0) {
                return undefined;
            }
            var key = arr[0];
            arr = arr.splice(1);
            if (Object.keys(objIn).indexOf(key) === -1) {
                return undefined;
            } else if (arr.length === 0) {

                delete objIn[key];
            } else {
                return get(objIn[key], arr);
            }
        }
    }
})();
