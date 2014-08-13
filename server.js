#!/usr/bin/env nodejs

(function() {
	var app = require('http').createServer();
	var io = require('socket.io')(app, {
		pingInterval: 20000,
		pingTimeout: 35000
	});
	app.listen(9000);


	var python_server = require('net').Socket();
	python_server.connect(9001, '127.0.0.1');

	var unprocessed_data = [];
	python_server.on('data', function(data) {
		var start_index = 0,
			data_length, index, key_and_value, space_index, key, value, parts, socket_id, client_id, client_ids, length, i;

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
					client_id_to_socket[value].disconnect();
				} else {
					client_ids = key.split(',');
					length = client_ids.length;
					for (i = 0; i < length; i++) {
						client_id_to_socket[client_ids[i]].emit('x', value);
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
			ip_address = socket.handshake.headers.hasOwnProperty('x-real-ip') ? socket.handshake.headers['x-real-ip'] : socket.handshake.address.address;

		socket_id_to_socket[socket.id] = socket;
		socket_id_to_client_id[socket.id] = null;

		python_server.write('connect ' + JSON.stringify([version, username, ip_address, socket.id]) + '\n');

		socket.on('disconnect', function() {
			var client_id = socket_id_to_client_id[socket.id];

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
