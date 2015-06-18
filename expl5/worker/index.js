/**
 * Created by flexalex on 5/4/15.
 */
(function () {
    'use strict';
    
    module.exports = function () {

        function Worker() {
            this._exec = require('child_process').fork;
        }

        Worker.prototype.execute = function (job, cb) {
        	this._cb = cb;
        	this._job = job;
            this._proc = this._exec(
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
            attachProcessListeners.apply(this);
            sendJob.call(this, this._job);
        };
        return Worker;
        /***
         * Attaches the process listeners
         */
        function attachProcessListeners() {
        	var that = this;

            this._proc.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            // Send the response and kill the child process
            this._proc.on('message', function (data) {
                that._cb(null, data);
                that._proc.kill('SIGINT');
            });
        }

        function sendJob(job) {
            this._proc.send(job);
        }
    };
})();
