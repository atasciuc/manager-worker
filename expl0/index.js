'use strict';
(function () {

	start();
	/******************* FUNCTS ****************/
	/**
	* Start the example
	**/
	function start() {
		iShouldSayHelloInOneSec('Code Gym');
		iBlockTheThread(5000);
	}
	/**
	* Displays hello in one sec
	*/
	function iShouldSayHelloInOneSec (to) {
		setTimeout (function () {
			console.log('Hello ' + to);
		}, 1000);
	}
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