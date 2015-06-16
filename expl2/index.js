'use strict';
(function () {
	var async = require('async');
	var _ = require('lodash');
	var count = 1000000;
	var pushes = [];

	profileFunctional(count);
	
	profileAsync(count);

	/****** FUNCTS *******/
	function profileFunctional () {
		console.log('Starting functional');
		console.time('Profiling functional');
		for (var index = 0; index <= count; index++) {
			pushes.push(function (cb) {
				setTimeout(cb, 0);
			});
		}
		console.timeEnd('Profiling functional');
	}

	function profileAsync (count) {
		console.log('Starting async');
		console.time('Profiling async');
		async.parallel(pushes,
		    function (err) {
		        console.timeEnd('Profiling async');
		    }
		);
	}
})();