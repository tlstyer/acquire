#!/usr/bin/env nodejs

(function() {
	'use strict';

	var port_web = parseInt(process.argv[2], 10);
	var port_python = parseInt(process.argv[3], 10);

	var app = require('express')();
	var body_parser = require('body-parser');
	var http = require('http').Server(app);
	var io = require('socket.io')(http, {
		pingInterval: 20000,
		pingTimeout: 35000
	});
	http.listen(port_web);

	var mysql = require('mysql');
	var pool = mysql.createPool({
		socketPath: '/var/run/mysqld/mysqld.sock',
		user: 'root',
		password: 'root',
		database: 'acquire',
		charset: 'utf8mb4'
	});

	var server_version = 'VERSION';
	var enums = require('./js/enums');


	app.use(body_parser.urlencoded({
		extended: false
	}));
	app.post('/server/report-error', function(req, res) {
		var message = req.body.hasOwnProperty('message') ? req.body.message.replace(/\n/g, '\n\t') : '<null>',
			trace = req.body.hasOwnProperty('trace') ? req.body.trace.replace(/\n/g, '\n\t') : '<null>';

		console.log('/server/report-error:', message);
		console.log('\t' + trace);
		console.log(' ', req.headers);

		res.end();
	});
	app.post('/server/set-password', function(req, res) {
		var version = req.body.hasOwnProperty('version') ? req.body.version.replace(/\s+/g, ' ').trim() : '',
			username = req.body.hasOwnProperty('username') ? req.body.username.replace(/\s+/g, ' ').trim() : '',
			password = req.body.hasOwnProperty('password') ? req.body.password.replace(/\s+/g, ' ').trim() : '',
			ip_address = req.headers.hasOwnProperty('x-real-ip') ? req.headers['x-real-ip'] : req.address.address,
			fields;

		res.setHeader('Content-Type', 'application/json');

		var return_result = function(error_id) {
				console.log('/server/set-password', version, username, password, ip_address, error_id);
				res.end(String(error_id));
			};

		if (version !== server_version) {
			return_result(enums.Errors.NotUsingLatestVersion);
		} else if (username.length < 1 || username.length > 32) {
			return_result(enums.Errors.InvalidUsername);
		} else if (!/^[0-9a-f]{64}$/.test(password)) {
			return_result(enums.Errors.GenericError);
		} else {
			pool.query('select * from user where name = ?', [username], function(err, results) {
				if (err === null) {
					if (results.length === 1) {
						if (results[0].password === null) {
							// set user's password
							fields = {
								password: password
							};
							pool.query('update user set ? where user_id = ?', [fields, results[0].user_id], function(err) {
								if (err === null) {
									return_result(null);
								} else {
									return_result(enums.Errors.GenericError);
								}
							});
						} else {
							// password already set
							return_result(enums.Errors.ExistingPassword);
						}
					} else {
						// insert user
						fields = {
							name: username,
							password: password
						};
						pool.query('insert into user set ?', [fields], function(err) {
							if (err === null) {
								return_result(null);
							} else {
								return_result(enums.Errors.GenericError);
							}
						});
					}
				} else {
					return_result(enums.Errors.GenericError);
				}
			});
		}
	});


	var python_server = require('net').Socket();
	python_server.connect(port_python, '127.0.0.1');

	var unprocessed_data = [];
	python_server.on('data', function(data) {
		var start_index = 0,
			data_length, index, key_and_value, space_index, key, value, parts, socket_id, client_id, socket, client_ids, length, i;

		data = data.toString();
		data_length = data.length;

		while (start_index < data_length) {
			index = data.indexOf('\n', start_index);
			if (index >= 0) {
				key_and_value = data.substring(start_index, index);
				start_index = index + 1;

				if (unprocessed_data.length > 0) {
					key_and_value = unprocessed_data.join('') + key_and_value;
					unprocessed_data = [];
				}

				space_index = key_and_value.indexOf(' ');
				key = key_and_value.substr(0, space_index);
				value = key_and_value.substr(space_index + 1);

				if (key === 'connect') {
					parts = JSON.parse(value);
					socket_id = parts[0];
					client_id = parts[1];
					socket_id_to_client_id[socket_id] = client_id;
					client_id_to_socket[client_id] = socket_id_to_socket[socket_id];
				} else if (key === 'disconnect') {
					socket = client_id_to_socket[value];
					if (socket) {
						socket.disconnect();
					} else {
						console.log('ERROR! 1. client_id ===', value);
					}
				} else {
					client_ids = key.split(',');
					length = client_ids.length;
					for (i = 0; i < length; i++) {
						socket = client_id_to_socket[client_ids[i]];
						if (socket) {
							socket.emit('x', value);
						} else {
							console.log('ERROR! 2. client_id ===', client_ids[i], value);
						}
					}
				}
			} else {
				unprocessed_data.push(data.substring(start_index));
				break;
			}
		}
	});


	var socket_id_to_socket = {};
	var socket_id_to_client_id = {};
	var client_id_to_socket = {};

	io.on('connect', function(socket) {
		var version = socket.handshake.query.hasOwnProperty('version') ? socket.handshake.query.version.replace(/\s+/g, ' ').trim() : '',
			username = socket.handshake.query.hasOwnProperty('username') ? socket.handshake.query.username.replace(/\s+/g, ' ').trim() : '',
			password = socket.handshake.query.hasOwnProperty('password') ? socket.handshake.query.password.replace(/\s+/g, ' ').trim() : '',
			ip_address = socket.handshake.headers.hasOwnProperty('x-real-ip') ? socket.handshake.headers['x-real-ip'] : socket.handshake.address.address;

		console.log(socket.id, 'connect', version, username, password, ip_address);

		socket_id_to_socket[socket.id] = socket;
		socket_id_to_client_id[socket.id] = null;

		var return_fatal_error = function(error_id) {
				console.log(socket.id, 'return_fatal_error', error_id);
				socket.emit('x', JSON.stringify([
					[enums.CommandsToClient.FatalError, error_id]
				]));
				socket.disconnect();
			};
		var pass_to_python = function() {
				console.log(socket.id, 'pass_to_python');
				python_server.write('connect ' + JSON.stringify([username, ip_address, socket.id]) + '\n');
			};
		if (version !== server_version) {
			return_fatal_error(enums.Errors.NotUsingLatestVersion);
		} else if (username.length < 1 || username.length > 32) {
			return_fatal_error(enums.Errors.InvalidUsername);
		} else {
			pool.query('select * from user where name = ?', [username], function(err, results) {
				console.log(socket.id, 'query_result', err, results);
				if (err === null) {
					if (results.length === 1) {
						if (results[0].password === null) {
							if (password.length > 0) {
								return_fatal_error(enums.Errors.ProvidedPassword);
							} else {
								pass_to_python();
							}
						} else {
							if (password.length === 0) {
								return_fatal_error(enums.Errors.MissingPassword);
							} else if (password !== results[0].password) {
								return_fatal_error(enums.Errors.IncorrectPassword);
							} else {
								pass_to_python();
							}
						}
					} else {
						if (password.length > 0) {
							return_fatal_error(enums.Errors.ProvidedPassword);
						} else {
							pass_to_python();
						}
					}
				} else {
					return_fatal_error(enums.Errors.GenericError);
				}
			});
		}

		socket.on('disconnect', function() {
			var client_id = socket_id_to_client_id[socket.id];

			console.log(socket.id, 'disconnect');

			delete socket_id_to_socket[socket.id];
			delete socket_id_to_client_id[socket.id];
			if (client_id) {
				delete client_id_to_socket[client_id];

				python_server.write('disconnect ' + client_id + '\n');
			}
		});

		socket.on('x', function(data) {
			var client_id = socket_id_to_client_id[socket.id];
			if (client_id) {
				python_server.write(client_id + ' ' + data.replace(/\s+/g, ' ') + '\n');
			}
		});
	});
})();
