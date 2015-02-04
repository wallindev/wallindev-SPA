'use strict';
/**
 * "Namespace" wallinApp
 *
 */
var wallinApp = angular.module('wallinApp', ['ngRoute', 'ngAnimate'])
// Routes
.config(function($routeProvider, $locationProvider) {

	// No hash prefix in HTML5
	$locationProvider.html5Mode(true);

	//console.log('$routeProvider: ', $routeProvider);
	//console.log('$locationProvider: ', $locationProvider);

	$routeProvider
	// Home
	.when('/', {
		templateUrl : 'page/home.html',
		controller  : 'homeCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// Home
	.when('/home', {
		templateUrl : 'page/home.html',
		controller  : 'homeCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// About
	.when('/about', {
		templateUrl : 'page/about.html',
		controller  : 'aboutCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// Services
	.when('/services', {
		templateUrl : 'page/services.html',
		controller  : 'servicesCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// Projects
	.when('/projects', {
		templateUrl : 'page/projects.html',
		controller  : 'projectsCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// Contact
	.when('/contact', {
		templateUrl : 'page/contact.html',
		controller  : 'contactCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	})
	// Chat
	// Since the chat route doesn't have a view, no controller will actually be loaded here.
	// However, if we don't define this route, .otherwise will fire and load error.html.
	// I.e this will result in that nothing happens, which is what we want.
	// The controller is instead loaded from the chat.ejs template markup
	.when('/chat', {
		// Do nothing
		//controller  : 'chatCtrl'
	})
	// Not defined
	.otherwise({
		templateUrl : 'page/error.html',
		controller  : 'errorCtrl',
		resolve 	: { delay: 'pauseRender' } /* Overridden by ngAnimate CSS */
	});

})
// Service that pauses rendering of the templates
// Overridden by ngAnimate CSS
.service('pauseRender', function($q, $timeout) {

	//console.log('$q: ', $q);
	//console.log('$timeout: ', $timeout);

	var delay = $q.defer();
	$timeout(delay.resolve, 0);
	return delay.promise;

})
// Javascript loader image
.factory('spinner', function() {

	var opts = {
		lines		: 10, // The number of lines to draw
		length		: 3, // The length of each line
		width		: 3, // The line thickness
		radius		: 5, // The radius of the inner circle
		corners		: 1, // Corner roundness (0..1)
		rotate		: 0, // The rotation offset
		direction	: 1, // 1: clockwise, -1: counterclockwise
		color		: '#fff', // #rgb or #rrggbb or array of colors
		speed		: 1, // Rounds per second
		trail		: 60, // Afterglow percentage
		shadow		: false, // Whether to render a shadow
		hwaccel		: false, // Whether to use hardware acceleration
		className	: 'spinner', // The CSS class to assign to the spinner
		zIndex		: 2e9, // The z-index (defaults to 2000000000)
		top			: '50%', // Top position relative to parent
		left		: '50%' // Left position relative to parent
	};
	var spinner = new Spinner(opts);
	return spinner;

})
// Service that sets active link in menu
.service('setLinks', function($location, $route, spinner) {

	return function(linkNumber) {
		//console.log('setLinks is run');
		//console.log($location);

		var i			= 0
		, linksParent	= $('#links')
		, linkListItem	= null
		, curLink		= null;

		// If 'obj' is an object user clicked the link
		/*if (typeof obj === 'object') {
			linkListItem = obj.target.parentElement;
		} else {*/
			linkListItem = $('#link_' + linkNumber)[0];
		//}

		// Show loader image
		spinner.spin();
		var $target = $('#loader');
		$target.append(spinner.el);

		// Hide loader image after 500 milliseconds
		setTimeout(function() {
			spinner.stop();
		}, 500);

		for (var i = 0; i < linksParent.children().length; i++) {
			curLink = $('#link_' + i);
			curLink.removeClass('active');
			if(linkListItem) {
				if (curLink[0].id === linkListItem.id) {
					curLink.addClass('active');
				}
			}
		}

		return false;
	}

})
// Variables factory
.factory('global', function() {

	return {
		// Constants
		VIEW_HTML		: true,
		STATUS			: 'Avvaktar',
		// DOM objects
		$messages		: $('#chat-messages'),
		$textarea		: $('#chat-textarea'),
		$chatName		: $('#chat-name'),
		$chatNameMsg	: $('#chat-name-msg'),
		$chatStatus		: $('#chat-status'),
		$chatStatusText	: $('#chat-status-text'),
		$chatUsers		: $('#chat-users')
	};

})
// Functions factory
.factory('func', function(global) {

	return {
		// App initialization
		init: function () {
			// Restore all elements
			global.$chatStatusText.removeClass().addClass('text-warning');
			global.$textarea.val('');
			global.$textarea.attr('disabled', true);
			global.$chatName.val('');
			global.$chatName.focus();
		},
		// To prevent users from emitting "dangerous" code to the server
		htmlspecialchars: function(str) {
			/*
			 * - Replace '&' with '&amp;'
			 * - Replace '"' with '&quot;'
			 * - Replace ''' with '&#039;'
			 * - Replace '<' with '&lt;'
			 * - Replace '>' with '&gt;'
			 */
			return str.replace(/&/gim, '&amp;').replace(/"/gim, '&quot;').replace(/'/gim, '&#039;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;');
		},
		// Sets status text at bottom or beside nick
		setStatus: function(msg, type, which, clear, restore) {
			var self = this;
			if (msg === undefined) {
				console.error("msg can't be empty");
				return 1;
			}
			if (type === undefined) type = 'info';
			if (which === undefined) which = 'status';
			if (clear === undefined) clear = false;
			if (restore === undefined) restore = true;

			if (which === 'nick') {
				global.$chatNameMsg.removeClass().addClass('text-' + type);
				global.$chatNameMsg.html(msg);
			} else {
				global.$chatStatusText.removeClass().addClass('text-' + type);
				global.$chatStatusText.html(msg);

				// Reset status message after 5 seconds
				if (restore) {
					if (msg !== global.STATUS) {
						setTimeout(function() {
							self.setStatus(global.STATUS, 'warning');
						}, 5000);
					}
				}
			}
			if (clear)
				global.$textarea.val('');
		}
	};

})
// Socket factory
.factory('socket', function(global, func, $exceptionHandler, $sce) {

	var currentPort = location.port ? location.port : 80;
	//console.log('currentPort: ', currentPort);

	var currentUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
	console.log('currentUrl: ', currentUrl);

	var socketProtocol = 'ws:'
	// If run locally use local socket host otherwise use openshift socket host
	, socketHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? location.hostname : 'nodejs-wallindev.rhcloud.com'
	// If run on OpenShift server we have to set websocket port to 8000
	// otherwise same as current http port (to avoid CORS - Cross-origin resource sharing - conflict)
	, socketPort = (socketHost === 'localhost' || socketHost === '127.0.0.1') ? currentPort : 8000
	, socketUrl = socketProtocol + '//' + socketHost + ':' + socketPort;
	console.log('socketUrl: ', socketUrl);

	var socket;
	try {
		socket = io.connect(socketUrl);
	} catch (e) {
		console.error('Error: ', e.message);
	}

	if (socket === undefined) {
		console.error('Error: ', e.message);
		return 1;
	}	
	return socket;

})
// Custom exception handling
.factory('$exceptionHandler', function() {

	return function(exception) {
		throw exception;
	};

})
// Custom filter (to allow HTML generation in bindings)
.filter('html', function($sce) {

	return function(val) {
		return $sce.trustAsHtml(val);
	};

})
// Menu controller
.controller('menuCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('menuCtrl is run');

})
// Home controller
.controller('homeCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('homeCtrl is run');

	setLinks(0);

})
// About controller
.controller('aboutCtrl', function(global, func, $scope, $rootScope, $exceptionHandler, $sce, setLinks, $location) {

	console.log('aboutCtrl is run');
	//console.log($rootScope.aboutTab);

	setLinks(1);

	// Show last active tab on page load
	if ($rootScope.aboutTab !== undefined) {
		var $bgTab		= $('#bgLi'),
			$kpTab		= $('#kpLi'),
			$wdTab		= $('#wdLi'),
			$bgContent 	= $('#bg'),
			$kpContent	= $('#kp'),
			$wdContent	= $('#wd');

		$bgTab.removeClass('active');
		$kpTab.removeClass('active');
		$wdTab.removeClass('active');

		$bgContent.removeClass('in active');
		$kpContent.removeClass('in active');
		$wdContent.removeClass('in active');

		switch($rootScope.aboutTab) {
			case '#bg':
				$bgTab.addClass('active');
				$bgContent.addClass('in active');
				break;
			case '#kp':
				$kpTab.addClass('active');
				$kpContent.addClass('in active');
				break;
			case '#wd':
				$wdTab.addClass('active');
				$kpContent.addClass('in active');
				break;
			default:
				;
		}
	}

	$scope.showAbout = function(tabNumber, e) {

		// Save active tab for later use
		$rootScope.aboutTab = e.target.hash;

		// Fix rounded corners on tab content
		var $tabContent = $('.tab-content');
		if (tabNumber > 0) {
			$tabContent.css('border-radius', '4px');
		} else {
			$tabContent.css('border-radius', '0 4px 4px');
		}
		//console.log($tabContent.css('border-radius'));

		e.preventDefault();
		//console.log(e.isDefaultPrevented());

	}

})
// Services controller
.controller('servicesCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('servicesCtrl is run');

	setLinks(2);

})
// Projects controller
.controller('projectsCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('projectsCtrl is run');

	setLinks(3);

	$scope.showPreview = function(prevNumber, e) {

		e.preventDefault();
		//console.log(e.isDefaultPrevented());

		var i					= 0
		, $previewsParent		= $('#projPreview')
		, $previewsParentSpan	= $('#projPreviewSpan')
		, $projShow				= $('#proj' + prevNumber)
		, $projShowUrl			= $('#proj' + prevNumber + '_url')
		, $projShowImg			= $('#proj' + prevNumber + '_img')
		, $curProj				= null
		, $curProjUrl			= null
		, $curProjImg			= null
		, curImgWidth			= $previewsParent.width()
		, curImgHeight			= $previewsParent.height();

		//console.log('curImgWidth: ' + curImgWidth);
		//console.log('curImgHeight: ' + curImgHeight);

		$previewsParentSpan.css('display', 'none');
		for (var i = 0; i < $previewsParent.children().length - 1; i++) { // length - 1 because of the span element
			$curProj = $('#proj' + i);
			$curProjUrl = $('#proj' + i + '_url');
			$curProjImg = $('#proj' + i + '_img');

			//$curProj.width(curImgWidth);
			//$curProj.height(curImgHeight);
			//$curProj.removeAttr('style');

			$curProjImg.width(curImgWidth);
			$curProjImg.height(curImgHeight);
			$curProjImg.removeAttr('style');
			//console.log($curProjImg.width());
			//console.log($curProjImg.height());

			$curProj.css('visibility', 'hidden');
			$curProj.css('position', 'absolute');
			$curProj.css('z-index', 100);
			$curProj.css('opacity', 0);
		}
		//console.log($projShow);
		//console.log($projShowUrl);
		//console.log($projShowImg);
		$projShow.css('position', 'relative');
		$projShow.css('visibility', 'visible');
		$projShow.css('z-index', 1000);
		$projShow.css('opacity', 1);
		return;
		//$projShowImg.removeAttr('style');

		//$previewsParent.width($projShow.width());
		//$previewsParent.height($projShow.height());
		//$previewsParent.removeAttr('style');

		//$projShow.show('slow');

	}

})
// Contact controller
.controller('contactCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('contactCtrl is run');

	setLinks(4);
	/*$scope.pageTitle = 'Kontaktuppgifter';
	$scope.welcome = 'Välkommen till kontakt-sidan!';*/

})
// Chat controller
.controller('chatCtrl', function(global, func, socket, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('chatCtrl is run');

	setLinks(5);
	/*$scope.pageTitle = 'Wallins Chat';
	$scope.welcome = '<p>1. Börja med att välja ett namn. Det kan innehålla bokstäver, siffror, tecknen "_" och "-", ska vara minst två tecken långt samt inte vara samma som en redan aktiv användare.</p>\n'
					+ '							<p>2. När du valt ett giltigt namn, skriv ditt meddelande i textboxen nedan.</p>';*/

	// Messages and users arrays, nick placeholder
	$scope.messages		= []
	, $scope.users		= []
	, $scope.nick		= '';

	// Restore all elements
	func.init();

	// Listen for listMessages emission from server
	socket.on('listMessages', function(messages) {
		// Display messages
		if (messages.length) {
			if (messages.length === 1) {
				// Add message first in messages array
				$scope.messages.unshift(messages[0]);
			} else {
				$scope.messages = messages;
			}

			// Must use this to allow for HTML in chat message
			// Change: Now using custom angular.js filter instead
			/*for (var i = 0; i < $scope.messages.length; i++) {
				$scope.messages[i].message = $sce.trustAsHtml($scope.messages[i].message);
			}*/

			try {
				$scope.$digest();
			} catch(e) {
				func.setStatus(e, 'danger');
				return 1;
			}
		}
	});

	// Listen for listUsers emission from server
	socket.on('listUsers', function(users) {
		// Display users
		if (users.length) {
			if (users.length === 1) {
				// Add user first in users array (if not already there)
				var userExists = false;
				if ($scope.users.length === 0) {
					userExists = false;
				} else {
					for (var i = 0; i < $scope.users.length; i++) {
						if ($scope.users[i].name === users[0].name) {
							userExists = true;
							break;
						}
					}
				}
				if (!userExists)
					$scope.users.unshift(users[0]);
			} else {
				$scope.users = users;
			}

			try {
				$scope.$digest();
			} catch(e) {
				func.setStatus(e, 'danger');
				return 1;
			}
		}
	});

	// Listen for removeUser emission from server
	socket.on('removeUser', function(nickName) {
		// Remove user from user array
		for (var i = 0; i < $scope.users.length; i++) {
			if ($scope.users[i].name === nickName) {
				$scope.users.splice(i, 1);
				$scope.$digest();
				break;
			}
		}
	});

	// Listen for status emission from server
	socket.on('status', function(data) {
		func.setStatus(data.message, data.type, data.which, data.clear, data.restore);
	});

	// Check nickname
	global.$chatName.on("keyup", function(e) {
		var nick	= $(this).val()
		, regex		= /^[a-öA-Ö0-9_-]{3,}$/;
		// Only do the check if value is different from saved nickname
		if (nick === $scope.nick) {
			func.setStatus('', 'warning', 'nick');
		} else {
			if (nick.length === 0) {
				func.setStatus('', 'warning', 'nick');
			} else {
				if (!regex.test(nick)) {
					func.setStatus('Ogiltigt namn', 'danger', 'nick');
				} else {
					socket.emit('checkNick', nick);
					// Reset info text
					func.setStatus('', 'warning', 'nick');
				}
			}
		}
		// Prevent default events
		e.preventDefault();
	});

	socket.on('checkNick', function(cleared) {
		if (!cleared) {
			func.setStatus('Namn upptaget', 'danger', 'nick');
			global.$textarea.attr('disabled', true);
		} else {
			func.setStatus('Namn OK', 'success', 'nick');
			global.$textarea.attr('disabled', false);
		}
	});

	// Listen for keydowns on textarea
	global.$textarea.on("keydown", function(e) {
		var nick	= global.$chatName.val()
		, msg		= $(this).val()
		, regex		= /^\s*$/;
		if (e.which === 13 && e.shiftKey === false) {
			if (regex.test(msg)) {
				func.setStatus('Meddelande kan inte vara tomt', 'danger', 'status');
			} else {
				// Store user nickname if not already stored
				if ($scope.nick === '') {
					$scope.nick = nick;
				} else {
					// If nick is stored, and it's been changed during same session
					// we have to remove old nick and replace with new
					if ($scope.nick !== nick) {
						socket.emit('removeUser', $scope.nick);
						$scope.nick = nick;
					}
				}

				// TODO: HTML or no HTML?
				socket.emit('insert', {
					name: $scope.nick,
					//message: msg
					message: (!global.VIEW_HTML) ? func.htmlspecialchars(msg) : msg
				});

				// Prevent default events
				e.preventDefault();
			}
		}
	});

	// Clear name status when name field loses focus
	global.$chatName.on("blur", function() {
		func.setStatus('', 'warning', 'nick');
	});
})
// Contact form controller
.controller('contactFormCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('contactFormCtrl is run');

	$scope.contactFormSubmit = function() {
		if ($scope.contactFormName === '') {
			
		}
	}
})
// Error controller
.controller('errorCtrl', function(global, func, $scope, $exceptionHandler, $sce, setLinks) {

	console.log('errorCtrl is run');

	setLinks('error');
	$scope.pageTitle = 'Nya Wallindev.se!';
	$scope.errorMsg = 'Denna sida finns inte.';

	setTimeout(function() {
		location.href = '/';
	}, 7000);

});
