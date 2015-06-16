/**
 * Created by flexalex on 5/4/15.
 */
(function () {
    'use strict';

    var _ = require('lodash');
    var uuid = require('node-uuid');

    module.exports = function () {

        // Holds a message into the que
        function Queue () {
            this._queue = [];
            var that = this;

            // Start listening to the queue
            setInterval(function () {
                that.dispatch();
            }, 100);
        }

        /***
         * Push new message into the queue
         * @param message
         * @param handler
         * @param dispatchIn
         * @param context
         */
        Queue.prototype.push = function (message, handler, dispatchIn) {
            this._queue.push({
                message: message,
                handler: handler,
                dispatchIn: dispatchIn,
                addedTime: new Date().getTime(),
                id: uuid.v4()
            });
        };
        /***
         * Dispatches an item out of the queue
         */
        Queue.prototype.dispatch = function () {
            var currentTime = new Date().getTime();
            _.forEach(this._queue, function (item) {
                if (currentTime - item.addedTime >= item.dispatchIn) {
                    item.dispatched = true;
                    item.handler(item.message);
                }
            });
            this._queue = _.filter(this._queue, function (item) {
                return !item.dispatched;
            });
        };
        return new Queue();
    };
})();
