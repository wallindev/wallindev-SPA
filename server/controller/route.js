'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {
	var express		= require('express')
	, router		= express.Router()
	, controller	= require('./controller')
	, url			= require('url');

	module.exports = {

		/* GET requested page. */
		routeRender: function(path, headers) {

			// JSON paths
			var paths = {
				'/': {
					'view'				: 'home',
					'clientController'	: 'homeCtrl',
					'serverController'	: 'homeController',
					'showSocket'		: false
				},
				/*'/home': {
					'view'				: 'home',
					'clientController'	: 'homeCtrl',
					'serverController'	: 'homeController',
					'showSocket'		: false
				},*/
				'/chat': {
					'view'				: 'chat',
					'clientController'	: 'chatCtrl',
					'serverController'	: 'chatController',
					'showSocket'		: true
				}/*,
				'/about': {
					'view'				: 'home',
					'clientController'	: 'aboutCtrl',
					'serverController'	: 'aboutController',
					'showSocket'		: false
				},
				'/contact': {
					'view'				: 'home',
					'clientController'	: 'contactCtrl',
					'serverController'	: 'contactController',
					'showSocket'		: false
				},
				'/projects': {
					'view'				: 'home',
					'clientController'	: 'projectsCtrl',
					'serverController'	: 'projectsController',
					'showSocket'		: false
				},
				'/error': {
					'view'				: 'home',
					'clientController'	: 'errorCtrl',
					'serverController'	: 'errorController',
					'showSocket'		: false
				}*/
			};

			var orgPath = path;

			// Changed from "redirecting" erroneous path to error page
			// to instead being redirected to start page
			if (paths[path] === undefined)
				path = '/';

			//console.log('path efter: ', path);
			//console.log('paths[path].view: ', paths[path].view);

			var ctrlCode = 'controller.' + paths[path].serverController + '()';
			//console.log('ctrlCode: ', ctrlCode);
			eval(ctrlCode);

			return router.get(orgPath, function(req, res) {
				res.render(paths[path].view,
				{
					headers			: headers,
					ngController	: paths[path].clientController,
					showSocket		: paths[path].showSocket/*, // The partials are included directly in the EJS templates instead
					partials:
					{
						header	: 'header',
						menu	: 'menu',
						footer	: 'footer'
					}*/
				});
			});

		}

	}

}();
