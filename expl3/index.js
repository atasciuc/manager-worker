'use strict';
(function () {
	var uuid = require('node-uuid');
	var async = require('async');
	var _ = require('lodash');
	var numberOfChilds = 20;
	var manager = require('./manager')(numberOfChilds, 1000);

	var processesRunning = 0;
	var totalRun = 0;

	setInterval(function () {
		if (processesRunning < numberOfChilds) {
			var jobToSend = {
		        id: uuid.v4(),
		        name: 'runner',
		        block: 5000
		    };
		    manager.process(jobToSend, function done (err, jobResult) {
		    	--processesRunning;
		    	console.log('Worker response. I processed ' + (++totalRun) + ' job(s)');
		    });
		    ++processesRunning;
		}
	}, 500);
})();