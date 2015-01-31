'use strict';
/*
 * "Namespace" wallinApp
 *
 */
var wallinApp = function() {

	// Includes
	var conf	= require('../include/config')
	, server 	= require('../include/config').server
	, func		= require('../include/functions');

	module.exports = {
		// Home controller
		homeController: function() {

			console.log('homeController is run');

		},
		// Chat controller
		chatController: function() {

			console.log('chatController is run');

			// Dependency modules
			var mongo		= require('mongodb').MongoClient
			, sync 			= require('synchronize') // To get rid of callbacks (still non-blocking for code outside fibers)
			, fiber			= sync.fiber
			, await			= sync.await
			, defer			= sync.defer
			, sockets		= require('socket.io').listen(server).sockets;

			// Database and collection objects
			var db			= {}
			, coll			= {};

			// Messages and users arrays
			var messages	= []
			, newMessages	= []
			, users			= [];

			// Date variables
			var dt 			= {} // Date object
			, stamp			= 0; // Timestamp

			/*
			 * Core database functionality
			 *
			 */
			// With --noauth
			//var connString = 'mongodb://' + conf.DBSERVER + '/' + conf.DBNAME;
			// With --auth
			var connString = 'mongodb://' + conf.DBUSER + ':' + conf.DBPASS + '@' + conf.DBSERVER + '/' + conf.DBNAME;
			func.devLog('connString: ' + connString);

			// Testing debugger
			//debugger;

			// Use synchronize.js to avoid callback hell =)
			fiber(function() {
				// Log time
				console.time("start");
				try {
					// Connect to and open db
					db = await(mongo.connect(connString, defer()));
					func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' opened.");

					// Database collection
					coll = db.collection('messages');

					// Retrieve 100 last messages, omit _id field
					messages = await(coll.find({}, { _id: 0 }).limit(100).sort({created: -1}).toArray(defer()));
					func.devLog("Messages retrieved (start): %s", JSON.stringify(messages));

					// Close DB
					if (db.openCalled) {
						// Has no result parameter in callback (as with db.open())
						await(db.close(false, defer()));
						func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' closed.");
					}
				} catch (e) {
					func.handleError(e);
					//func.handleError(e, __file, __line);
				}
				// End time logging
				console.timeEnd("start");
			});

			// Run the "save loop" every minute:
			setInterval(function() {
				if (newMessages.length) {
					fiber(function() {
						// Log time
						console.time("save loop");
						try {
							// Open DB
							var success = false;
							if (!db.openCalled) {
								success = await(db.open(defer()));
								if (success) {
									func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' opened.");
								} else {
									func.handleError(new Error("Couldn't open database"));
									//func.handleError("Couldn't open database", __file, __line, __stack);
								}

								// Checking authentication settings
								/*
								for (var elem in db.serverConfig.auth)
									console.log('db.serverConfig.auth.' + elem + ': ', db.serverConfig.auth[elem]);

								for (var i = 0; i < db.serverConfig.auth.length(); i++)
									console.log(db.serverConfig.auth.get(i));
								*/

								// Authenticate user
								success = await(db.authenticate(conf.DBUSER, conf.DBPASS, defer()));
								if (success) {
									func.prodLog("User '" + conf.DBUSER + "' authenticated on '" + conf.DBSERVER + "'.");
								} else {
									func.handleError(new Error("Couldn't authenticate user '" + conf.DBUSER + "' on '" + conf.DBSERVER + "'."));
								}
							}

							// Insert the new documents
							var messagesInserted = await(coll.insert(newMessages, defer()));
							func.devLog('Messages inserted: %s', JSON.stringify(messagesInserted));

							// Empty newMessages array
							newMessages = [];

							// Close DB
							if (db.openCalled) {
								// Has no result parameter in callback (as with db.open())
								await(db.close(false, defer()));
								func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' closed.");
							}
						} catch (e) {
							func.handleError(e);
							//func.handleError(e, __file, __line);
						}
						// End time logging
						console.timeEnd("save loop");
					});
				}
			}, 60000);

			// Fires when there's a http connection to the server
			sockets.on('connection', function(socket) {
				// Since db connections are done synchronously, there may be a connection to the web server before
				// the db object is propagated (i.e. when the server is restarted)
				// We then tell the user to please reload the browser
				if (!db.open) {
					func.sendStatus({
						message:	'Databasen är temporärt okontaktbar, vänligen ladda om din webbläsare',
						type:		'primary',
						which:		'status',
						clear:		false,
						restore:	false
					}, socket);
					return 1;
				}

				// Welcome user
				var welcomeMsg = 'Välkommen till chatten! =)';
				func.sendStatus({
					message:	welcomeMsg,
					type:		'primary',
					which:		'status',
					clear:		false
				}, socket);

				fiber(function() {
					// Log time
					console.time("client connection");
					try {
						// Open DB
						var success = false;
						if (!db.openCalled) {
							success = await(db.open(defer()));
							if (success) {
								func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' opened.");
							} else {
								func.handleError(new Error("Couldn't open database"));
								//func.handleError("Couldn't open database", __file, __line, __stack);
							}

							// Authenticate user
							success = await(db.authenticate(conf.DBUSER, conf.DBPASS, defer()));
							if (success) {
								func.prodLog("User '" + conf.DBUSER + "' authenticated on '" + conf.DBSERVER + "'.");
							} else {
								func.handleError(new Error("Couldn't authenticate user '" + conf.DBUSER + "' on '" + conf.DBSERVER + "'."));
							}
						}

						// Retrieve 100 last messages, omit _id field
						messages = await(coll.find({}, { _id: 0 }).limit(100).sort({created: -1}).toArray(defer()));
						func.devLog("Messages retrieved (sockets.on('connection')): %s", JSON.stringify(messages));

						// Close DB
						if (db.openCalled) {
							// Has no result parameter in callback (as with db.open())
							await(db.close(false, defer()));
							func.prodLog("Connection to '" + conf.DBNAME + "' on '" + conf.DBSERVER + "' closed.");
						}

						// If there are new messages that are not yet saved to db, we have to include them here
						//func.devLog('new messages: ', newMessages);
						//func.devLog('old messages: ', messages);
						var allMessages = [];
						if (newMessages.length) {
							allMessages = newMessages.concat(messages);
						} else {
							allMessages = messages;
						}
						//func.devLog('all messages: ', messages);

						// Send messages array to client
						socket.emit('listMessages', allMessages);

						// Get rid of temp allMessages array
						allMessages = null;
						//delete allMessages; // Can't delete defined variable (with 'var')

						// Send users array to client
						socket.emit('listUsers', users);
					} catch (e) {
						func.handleError(e);
						//func.handleError(e, __file, __line);
					}
					// End time logging
					console.timeEnd("client connection");
				});

				// Check if nickname is taken
				socket.on('checkNick', function(nickName) {
					// If user array is empty, cleared is true
					// If not iterate through and search for duplicates
					// If no duplicates found, cleared is true
					// Unshift puts user as first object in array instead of last
					var cleared = true;
					if (users.length === 0) {
						cleared = true;
					} else {
						for (var i = 0; i < users.length; i++) {
							if (users[i].name === nickName) {
								cleared = false;
								break;
							}
						}
					}

					socket.emit('checkNick', cleared);
				});

				// Listen for insert emission from client
				socket.on('insert', function(message) {
					// Add date on server instead of client
					// in the form of a timestamp
					var tmpDate = (new Date()).getTime();
					message.created = tmpDate;

					// Checking for empty values and regex pattern matching
					var regex1	= /^\s*$/
					, regex2	= /^[a-öA-Ö0-9_-]{3,}$/ // Letters a-ö, A-Ö, numbers 0-9, special characters _ and -, and atleast 3 of them
					, msg		= '';
					if (regex1.test(message.name) || regex1.test(message.message)) {
						msg = 'Namn eller meddelande kan inte vara tomt.';
						console.error(msg);
						func.sendStatus({
							message:	msg,
							type:		'danger',
							which:		'status',
							clear:		false
						}, this);
						return 1;
					} else if (!regex2.test(message.name)) {
						msg = 'Namnet måste vara minst tre tecken långt och innehålla giltiga tecken.';
						console.error(msg);
						func.sendStatus({
							message:	msg,
							type:		'danger',
							which:		'status',
							clear:		false
						}, this);
						return 1;
					} else {
						// Insert to messages array and send to client
						newMessages.unshift(message);
						func.devLog('Inserted message:', JSON.stringify(message));

						// Send message to all clients
						sockets.emit('listMessages', [message]);

						func.sendStatus({
							message:	'Meddelandet sänt',
							type:		'success',
							which:		'status',
							clear:		true
						}, this);

						var user = {
							id: this.id,
							name: message.name,
							created: (new Date()).getTime() // Timestamp
						};

						// If user array is empty, insert user object
						// If not iterate through and search for duplicates
						// If no duplicates found, insert user object
						// Unshift puts user as first object in array instead of last
						var userExists = false;
						if (users.length === 0) {
							userExists = false;
						} else {
							for (var i = 0; i < users.length; i++) {
								if (users[i].name === user.name) {
									userExists = true;
									break;
								}
							}
						}

						if(!userExists) {
							users.unshift(user);

							// Send status message to everyone else
							func.sendStatusOthers({
								message:	'<em>' + user.name + '</em> har anslutit sig till chatten',
								type:		'primary',
								which:		'status',
								clear:		false
							}, socket);
						}

						// Add user on all clients user lists
						sockets.emit('listUsers', [user]);
					}
				});

				socket.on('removeUser', function(nickName) {
					for (var i = 0; i < users.length; i++) {
						if (users[i].name === nickName) {
							users.splice(i, 1);
							// Remove user from clients user lists
							sockets.emit('removeUser', nickName);
							break;
						}
					}
				});

				// Listen for client disconnect
				socket.on('disconnect', function() {
					// Remove user from user array
					var nickName = '';
					if (users.length > 0) {
						nickName = '';

						for (var i = 0; i < users.length; i++) {
							if (users[i].id === this.id) {
								nickName = users[i].name;
								users.splice(i, 1);
								break;
							}
						}

						// If user has sent messages and thus is registrered with name
						if (nickName !== '') {
							// Remove user from clients user lists
							sockets.emit('removeUser', nickName);

							// Send status message to everyone else
							func.sendStatusOthers({
								message:	'<em>' + nickName + '</em> har lämnat chatten',
								type:		'info',
								which:		'status',
								clear:		false
							}, socket);
						}
					}
				});
			});
		}/*,
		// About controller
		aboutController: function() {

			console.log('aboutController is run');

		},
		// Contact controller
		contactController: function() {

			console.log('contactController is run');

		},
		// Projects controller
		projectsController: function() {

			console.log('projectsController is run');

		},
		// Error controller
		errorController: function() {

			console.log('errorController is run');

		}*/
	}
}();
