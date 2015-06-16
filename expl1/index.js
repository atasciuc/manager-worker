'use strict';
(function () {
	var async = require('async');

	console.time('profiling');
	async.parallel([
		function first(cb) {
			setTimeout(function () {
				console.log('Returning from the first function')
				cb();
			}, 1000);
		},
		function second(cb) {
			setTimeout(function () {
				console.log('Returning from the second function')
				cb();
			}, 1000);
		}
	], function (err) {
		console.log('I have finished')
		console.timeEnd('profiling');
	});

	iBlockTheThread(4000);
	/**
	* Blocks the thread
	*/
	function iBlockTheThread (timeToBlock) {
		var timeStart = (new Date()).getTime();
		setTimeout(function () {
			var timeCurrent = (new Date()).getTime();
			while ((timeCurrent - timeStart) < timeToBlock) {
				console.log('I am blocking: ' + (new Date()))	
				timeCurrent = (new Date()).getTime();			
			}
		}, 0);
	}
})();