/**
 * Created by flexalex on 5/4/15.
 */
(function () {
    'use strict';
    /*global logger*/
    var _ = require('lodash');
    var queue = require('./queue')();
    var _manager = null;
    var uuid = require('node-uuid');
    var Worker = require('../worker');

    /**
     * Create manager singilton
     * @type {Function}
     */
    module.exports = function (maxChilds, workerIdleTime) {

        // No manager created yet
        if (_manager === null) {

            _manager = createManager(maxChilds, workerIdleTime);
        }
        return _manager;

        /***
         * Creates a manager instance
         * @param maxChilds
         * @return {module.createManager.Manager}
         */
        function createManager(maxChilds, workerIdleTime) {
            var _maxChilds;
            var _workers = [];

            /***
             * Instantiate the manager
             * @param maxChilds. - maximum number of child to span
             * @constructor
             * @param workerIdleTime - how long for the worker to run before shutting down
             */
            function Manager(maxChilds, workerIdleTime) {
                _maxChilds = maxChilds;
                for (var i = 0; i < _maxChilds; i++) {
                    _workers.push(new Worker(workerIdleTime));
                }
            }

            /***
             * Processes the messages by spaning a worker
             * if the limit of the worker is reached will queue
             * the message
             * @param job
             * name: the job name wich should match the script
             * params: parameters to pass to the script, params will be returned to you
             * when job is done as a second parameter
             * @param done
             */
            Manager.prototype.process = function (job, done) {
                var worker = availableWorker();
                if (!worker) {
                    queue.push({
                        job: job,
                        callback: done,
                        id: uuid.v4()
                    }, processQueue, 1000);
                } else {
                    dispatchWorker(worker, job, done);
                }
            };
            /***
             * Processes a queued message
             * @param message
             */
            Manager.prototype.processQueue = processQueue;

            /***
             * Dispatches a new worker
             * @param job
             * @param done
             */
            function dispatchWorker(worker, job, done) {
                worker.execute(job, done);
            }

            /***
             * Looks for a read to execute worker
             * @return {boolean}
             */
            function availableWorker () {
                var worker = false;
                _.forEach(_workers, function (item) {
                    if (item.isReady() && !item.isRunning()) {
                        worker = item;
                    }
                });
                return worker;
            }

            /***
             * Processes a queu
             * @param message
             */
            function processQueue (message) {
                _manager.process(message.job, message.callback);
            }
            return new Manager(maxChilds, workerIdleTime);
        }
    };
})();
