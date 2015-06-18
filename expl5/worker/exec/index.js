(function () {
    'use strict';
    // simulate long task an return the result
    process.on('message', function (data) {
        console.time(data.id);
        setTimeout(function () {
            console.timeEnd(data.id);
            process.send(data);
        }, data.block);
    });
})();