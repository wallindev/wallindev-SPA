'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {
	// Includes
	var conf		= require('./include/config')
	, app 			= require('./include/config').app
	, server 		= require('./include/config').server
	, logger 		= require('./include/config').logger
	, bodyParser	= require('./include/config').bodyParser
	, cookieParser	= require('./include/config').cookieParser
	, func			= require('./include/functions')
	, route			= require(conf.controllerDir + '/route');

	/*
	 * App configuration
	 *
	 */
	// Views directory / View engine (EJS)
	app.set('views', conf.viewDir);
	app.set('view engine', 'ejs');

	//app.use(favicon(__dirname + '/public/favicon.ico'));
	//app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());

	// Use for all requests for static content
	app.use(conf.express.static(conf.publicDir));

	// Use for every request that isn't for static content
	app.use('/', function (req, res, next) {
		//var fullUrl = req.protocol + '://' + req.hostname + req.originalUrl;
		//console.log('fullUrl: ', fullUrl);

		var path = req.path;

		// Remove trailing slash
		if(path.substr(-1) === '/' && path.length > 1)
			path = path.slice(0, -1);

		console.log('path: ', path);

		// If request for socket.io, ignore
		/*if (path === '/socket.io')
			return;*/

		// Pass current path to our router and render page
		// title. description, keywords and author is used in partial header.ejs
		app.use(route.routeRender(path, {
			title: conf.appTitle,
			description: conf.appDescription,
			keywords: conf.appKeywords,
			author: conf.appAuthor,
			vendorDir: conf.vendorDir
		}));

		next();
	});

	func.prodLog('Web server started. Listening on port ' + conf.httpPort);

}();
