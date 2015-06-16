'use strict';
(function () {
	var _ = require('lodash');
	var threads = Array(21).join(1).split('')

	runner(threads);

    function runner (threads) {
    	var totalRun = 0;
    	_.forEach(threads, function () {
			setInterval (function () {
				console.log('I am in thread runner i processed ' + (++totalRun) + ' job(s)');
				iBlockTheThread(1000);
    		}, 500);
    	});
    }

    /**
	* Blocks the thread
	*/
	function iBlockTheThread (timeToBlock) {
		setTimeout(function () {
			var timeStart = (new Date()).getTime();
			var timeCurrent = (new Date()).getTime();
			while ((timeCurrent - timeStart) < timeToBlock) {
				timeCurrent = (new Date()).getTime();			
			}
		}, 0);
	}
})();