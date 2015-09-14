'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {

	// For building paths
	var path			= require('path')
	, express			= require('express')
	, app				= express()
	, httpPort 			= process.env.OPENSHIFT_NODEJS_PORT  || 80
	, ipAddress			= process.env.OPENSHIFT_NODEJS_IP  || "127.0.0.1";

	// Define exports directly so we don't have to do the long exports list in the end
	module.exports = {
		/*
		 * Globals
		 *
		 */

		// Directories
		publicDir			: path.join(__dirname, '../../client')
		, vendorDir			: path.join('/vendor')
		, modelDir			: path.join(__dirname, '../model')
		, viewDir			: path.join(__dirname, '../view')
		, controllerDir		: path.join(__dirname, '../controller')

		// OpenShift node.js port and IP address
		, httpPort			: httpPort
		, ipAddress			: ipAddress

		// Dependency modules
		, express			: require('express')
		, app				: app
		, logger			: require('morgan')
		, bodyParser		: require('body-parser')
		, cookieParser		: require('cookie-parser')
		, server			: app.listen(httpPort, ipAddress)

		// Mode of application
		, DEVMODE			: false
		, PRODMODE			: true //!DEVMODE

		// Title, description, keywords, author
		, appTitle			: "Wallindev | Node.js, Express.js, Angular.js | Wallin Systemutveckling"
		, appDescription	: "Wallindev - Wallin Systemutveckling, Node.js, Express.js, Angular.js och JavaScript. Webbutveckling, programmering och systemutveckling"
		, appKeywords		: "Wallindev, Wallin Systemutveckling, WallinDev, Mikael Wallin, webbutveckling, programmering, systemutveckling, Node.js, Express.js, Angular.js, JavaScript"
		, appAuthor			: "Mikael Wallin, Wallin Systemutveckling"

		// Database constants
		, DBSERVER			: process.env.OPENSHIFT_MONGODB_DB_HOST || "127.0.0.1"
		, DBPORT			: process.env.OPENSHIFT_MONGODB_DB_PORT || 27017
		, DBNAME			: 'chat'
		, DBUSER			: 'chatUser'
		, DBPASS			: 'chatPassword'
		//, DBNAME			: process.env.OPENSHIFT_MONGODB_DB_NAME || 'chat'
		//, DBUSER			: process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'chatUser'
		//, DBPASS			: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "chatPassword";

	}

	// Stack property
	Object.defineProperty(global, '__stack', {
		get: function() {
			var orig = Error.prepareStackTrace;
			Error.prepareStackTrace = function(_, stack){ return stack; };
			var err = new Error;
			Error.captureStackTrace(err, arguments.callee);
			var stack = err.stack;
			Error.prepareStackTrace = orig;
			return stack;
		}
	});

	// Line property
	Object.defineProperty(global, '__line', {
		get: function() {
			return __stack[1].getLineNumber();
		}
	});

	// File property
	Object.defineProperty(global, '__file', {
		get: function() {
			return __stack[1].getFileName().split('/').slice(-1)[0];
		}
	});

}();
