'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {

	/*
	 * Globals
	 *
	 */
	// For building paths
	var path			= require('path');

	// Directories
	var publicDir		= path.join(__dirname, '../public')
	, modelDir			= path.join(__dirname, '../model')
	, viewDir			= path.join(__dirname, '../view')
	, controllerDir		= path.join(__dirname, '../controller');

	// OpenShift node.js port and IP address
	var httpPort		= process.env.OPENSHIFT_NODEJS_PORT  || 80
	, ipAddress			= process.env.OPENSHIFT_NODEJS_IP  || "127.0.0.1";

	// Dependency modules
	var express		= require('express')
	, app			= express()
	, logger		= require('morgan')
	, bodyParser	= require('body-parser')
	, cookieParser	= require('cookie-parser')
	, server		= app.listen(httpPort, ipAddress);

	// Mode of application
	var DEVMODE			= false
	, PRODMODE			= true; //!DEVMODE;

	// App title
	var appTitle		= "Wallindev's Node.js Chat App";

	// Database constants
	var DBSERVER		= process.env.OPENSHIFT_MONGODB_DB_HOST || "127.0.0.1"
	, DBPORT			= process.env.OPENSHIFT_MONGODB_DB_PORT || 27017
	, DBNAME			= 'chat'
	, DBUSER			= 'chatUser'
	, DBPASS			= 'chatPassword';
	//, DBNAME			= process.env.OPENSHIFT_MONGODB_DB_NAME || 'chat'
	//, DBUSER			= process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'chatUser'
	//, DBPASS			= process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "chatPassword";

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

	module.exports = {
		DEVMODE:		DEVMODE,
		PRODMODE:		PRODMODE,
		appTitle:		appTitle,
		publicDir:		publicDir,
		modelDir:		modelDir,
		viewDir:		viewDir,
		controllerDir:	controllerDir,
		httpPort:		httpPort,
		ipAddress:		ipAddress,
		DBSERVER:		DBSERVER,
		DBPORT:			DBPORT,
		DBNAME:			DBNAME,
		DBUSER:			DBUSER,
		DBPASS:			DBPASS,
		express:		express,
		app:			app,
		server:			server,
		logger:			logger,
		bodyParser:		bodyParser,
		cookieParser:	cookieParser
	}

}();
