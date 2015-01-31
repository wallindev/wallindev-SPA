'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {

	// Dependency modules
	var conf	= require('./config');

	/*
	 * Functions
	 *
	 */
	// Send status messages to all sockets (connected clients)
	var sendStatusAll = function(data) {
		sockets.emit('status', data);
	}

	// Send status messages to specific socket (connected client)
	var sendStatus = function(data, s) {
		s.emit('status', data);
	}

	// Send status messages to all (connected clients) except for the one sending
	var sendStatusOthers = function(data, s) {
		s.broadcast.emit('status', data);
	}

	var getTimestamp = function () {
		var dt = new Date();
		dt.setHours(dt.getHours()-24);
		var stamp = dt.getTime();
		return stamp;
	}

	var handleError = function(error, file, line, stack) {
		if (!stack)
			stack = error.stack;

		console.error(new Date() + ":\nException of type '" + error.name + "' thrown:\n", error.message + "\n", "Stack:\n" + error.stack);
		//console.error(new Date() + ":\nError of type '" + error.name + "' in file '" + file + "' on line " + line + ":\n", error.message + "\n", "Stack:\n" + stack);
		//process.exit(1);
	}

	// Console.log in development mode
	var devLog = function() {
		if (conf.DEVMODE) {
			if (arguments.length === 2)
				console.log(arguments[0], arguments[1]);
			else
				console.log(arguments[0]);
		}
	}

	// Console.log in production mode
	var prodLog = function() {
		if (conf.PRODMODE) {
			if (arguments.length === 2)
				console.log(arguments[0], arguments[1]);
			else
				console.log(arguments[0]);
		}
	}

	/**
	 * Checks if 'needle' is found in 'haystack', automatically handles
	 * different data types. If set to true, parameter 'keys' tells the function
	 * to search among the keys instead of values in haystack (default = false)
	 *
	 * @param {*} haystack The object, array, string or number series that is to be searched.
	 * @param {string} needle The character, string or number that is to be searched for.
	 * @param {boolean} [keys] Optional parameter to search for key instead of value, default false.
	 * @return {boolean} Success or failure of the search operation or null if an error occurs.
	 */
	var contains = function(haystack, needle, keys) {
		if (haystack === undefined) {
			console.error("You have to supply 'haystack'");
			return null;
		}

		if (haystack.length === 0) {
			console.log('Object contains no data');
			return null;
		}

		if (keys === undefined) keys = false;

		/** @private */ var type = Object.prototype.toString.call(haystack);

		switch (type) {
			case '[object Object]':
				if (keys) {
					var objKeys = Object.keys(haystack);
					return (objKeys.indexOf(needle) !== -1);
				} else {
					for (var i = 0; i < haystack.length; i++) {
						if (haystack[i] === needle) {
							return true;
						}
					}
				}
				return false;
				break;
			case '[object Array]':
				if (keys) {
					var arrKeys = Object.keys(haystack);
					return (arrKeys.indexOf(needle.toString()) !== -1);
				} else {
					return (haystack.indexOf(needle) !== -1);
				}
				break;
			case '[object String]':
				if (keys) {
					console.error("Type '" + type + "' does not have keys");
					return null;
				} else {
					return (haystack.indexOf(needle) !== -1);
				}
				break;
			case '[object Number]':
				if (keys) {
					console.error("Type '" + type + "' does not have keys");
					return null;
				} else {
					return (haystack.toString().indexOf(needle) !== -1);
				}
				break;
			default:
				console.error("Type '" + type + "' not supported");
				return null;
		}
	}

	module.exports = {
		sendStatusAll:		sendStatusAll,
		sendStatus:			sendStatus,
		sendStatusOthers:	sendStatusOthers,
		getTimestamp:		getTimestamp,
		handleError:		handleError,
		devLog:				devLog,
		prodLog:			prodLog
	}

}();
