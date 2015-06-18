'use strict';
(function () {
	var async = require('async');
	var uuid = require('node-uuid');
	var _ = require('lodash');
	var numberOfChilds = 21;
	var manager = require('./manager')(numberOfChilds);

	var processesRunning = 0;
	var totalRun = 0;

	setInterval(function () {
		if (processesRunning < numberOfChilds) {
			var jobToSend = {
		        block: 5000,
		        id: uuid.v4()
		    };
		    manager.process(jobToSend, function done (err, jobResult) {
		    	--processesRunning;
		    	console.log('Worker response. I processed ' + (++totalRun) + ' job(s)');
		    });
		    ++processesRunning;
		}
	}, 500);
})();