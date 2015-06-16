/**
 * Created by flexalex on 5/4/15.
 */
(function () {
    'use strict';

    var uuid = require('node-uuid');
    var _ = require('lodash');
    /**
     * @param keepAlive time to keep worker alive when idle
     */
    module.exports = function (keepAlive) {
        return createWorker(keepAlive);

        /***
         * @param keepAlive The time to keep worker alive when iddle
         * @return {module.createWorker.Worker}
         */
        function createWorker (keepAlive) {

            return instantiateWorker(keepAlive);

            /**
             * Instantiates a new worker
             * @param keepAlive
             */
            function instantiateWorker (keepAlive) {
                var _keepAliveTime = 0;
                var _ready = true;
                var _running = false;
                var _dispatched = false;
                var _lastTask = null;
                var _proc = null;
                var _stdout = '';
                var _stderr = '';
                var _id = null;
                var _events = {
                    halt: [],
                    stdout: [],
                    stderr: []
                };
                var _eventNames = [
                    'halt',
                    'stdout',
                    'stderr'
                ];
                var _workerInstance = null;
                var _callBacks = [];

                function Worker(keepAlive) {
                    _workerInstance = this;

                    _keepAliveTime = keepAlive || 0;
                    this._exec = require('child_process').fork;
                    _id = uuid.v4();

                    if (_keepAliveTime > 0) {
                        setInterval(function checkIdleState() {
                            if (_lastTask && _proc && (new Date().getTime() - _lastTask.getTime()) >= keepAlive) {
                                console.info('Worker with id: ' + _id + ' goes to idle state. Worker PID: ' +
                                _proc.pid);
                                _proc.kill('SIGINT');
                            }
                        }, 500);
                    }
                }

                /***
                 * Executes a worker job
                 * @param job
                 * @param cb
                 */
                Worker.prototype.execute = function (job, cb) {
                    if (_running) {
                        throw new Error('The worker is processing a job already');
                    }
                    _lastTask = null;
                    if (!_dispatched) {
                        _dispatched = true;
                        console.info('Lunching worker with id: ' + _id);
                        _proc = this._exec(
                            'index.js',
                            [
                                '-v'
                            ],
                            {
                                cwd: 'worker/exec',
                                silent: true,
                                stdio: [
                                    'pipe', // Stdin
                                    'pipe', // Stdout
                                    'pipe'  // Stderr
                                ]
                            }
                        );
                        attachProcessListeners();
                    }
                    _running = true;
                    sendJob(job, cb);
                };

                /***
                 * Called when job is done
                 */
                Worker.prototype.jobDoneCleanWorker = function () {
                    _lastTask = new Date();
                    _stdout = '';
                    _stderr = '';
                    _running = false;
                };

                /***
                 * Returns true if worker is processing the job
                 * @return {boolean}
                 */
                Worker.prototype.isRunning = function () {
                    return _running;
                };

                /***
                 * Returns true if worker ready
                 * @return {boolean}
                 */
                Worker.prototype.isReady = function () {
                    return _ready;
                };

                /***
                 * Returns true if worker was dispatched
                 * @return {boolean}
                 */
                Worker.prototype.dispatched = function () {
                    return _dispatched;
                };

                /***
                 * Returns worker id
                 * @return {*}
                 */
                Worker.prototype.getId = function () {
                    return _id;
                };

                /****
                 * Process Id
                 */
                Worker.prototype.getProcessId = function () {
                    if (_proc) {
                        return _proc.pid;
                    }
                    return 'not started';
                };

                /***
                 * Attaches an event listener
                 */
                Worker.prototype.on = function (event, listener) {

                    if (_eventNames.indexOf(event) === -1) {

                        throw new Error('There is no event `' + event + '` to listen to');
                    }
                    _events[event].push(listener);
                };

                /***
                 * Attaches the process listeners
                 */
                function attachProcessListeners() {
                    _proc.stdout.on('data', function (data) {
                        _stdout += data.toString();
                        console.log(data.toString());
                        emit.call(_workerInstance, 'stdout', data);
                    });

                    _proc.stderr.on('data', function (data) {
                        _stderr += data.toString();
                        console.error(data.toString());
                        emit.call(_workerInstance, 'stderr', data);
                    });
                    _proc.on('close', function (_) {
                        _dispatched = false;
                        // Dispatch an event  notifying that the process is halt
                        emit.call(_workerInstance, 'halt', this);

                        _workerInstance.jobDoneCleanWorker();
                        _lastTask = null;
                    });
                    _proc.on('message', function (data) {
                        if (data.logger) {
                            return console[data.type](data.message);
                        } else {
                            childMessage(data);
                        }
                    });
                }

                /**
                 * Called when the child finished processing the job
                 * @param data
                 */
                function childMessage(data) {
                    var callbackId = data.callbackId;
                    var index = _.findIndex(_callBacks, { id: callbackId });
                    if (index < 0) {
                        _workerInstance.jobDoneCleanWorker();
                        return;
                    }
                    var done = _callBacks[index].cb;
                    if (data.success && _.isFunction(done)) {
                        done(null, data.result);
                    } else if (data.error && _.isFunction(done)) {
                        done(data.error);
                    }
                    _workerInstance.jobDoneCleanWorker();
                    delete _callBacks[index];
                }

                /***
                 * Sends a job to the worker
                 * @param job
                 * @param callback
                 */
                function sendJob(job, callback) {
                    var id = uuid.v4();
                    _callBacks.push({
                        id: id,
                        cb: callback
                    });
                    _proc.send({
                        job: job,
                        callbackId: id
                    });
                }

                /***
                 * Dispatches the event to the listeners
                 * @private
                 */
                function emit() {
                    var args = Array.prototype.slice.call(arguments);
                    var event = args[0];
                    /*jshint validthis: true */
                    var that = this;
                    var postArgument = args.splice(1);
                    _.forEach(query(event, _events), dispatch);
                    function dispatch(listener) {
                        listener.apply(that, postArgument);
                    }
                }

                /**
                 * Executes a query towards the object and
                 * return the object in the query if
                 * not found returns undefined
                 * @param queryString   - example user.0.name
                 * @param obj       - object to look in
                 * @return {*}
                 */
                function query(queryString, obj) {
                    var elements = queryString.split('.');

                    return get(obj, elements);

                    function get(objIn, arr) {
                        if (arr.length === 0) {
                            return undefined;
                        }
                        var key = arr[0];
                        arr = arr.splice(1);
                        if (Object.keys(objIn).indexOf(key) === -1) {
                            return undefined;
                        } else if (arr.length === 0) {

                            return objIn[key];
                        } else {
                            return get(objIn[key], arr);
                        }
                    }
                }
                return new Worker(keepAlive);
            }
        }
    };
})();
