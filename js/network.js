define(function(require) {
	var ws = null,
		enums = require('enums'),
		pubsub = require('pubsub'),
		isBrowserSupported = function() {
			return 'WebSocket' in window;
		},
		server_url = null,
		initializeServerUrl = function() {
			var result = /^http(s?):\/\/([^\/]+)\//.exec(window.location.href);

			if (result !== null) {
				server_url = 'ws' + result[1] + '://' + result[2] + '/acquire/server';
			} else {
				server_url = 'ws://localhost:9000';
			}
		},
		connect = function(username) {
			if (ws === null) {
				ws = new WebSocket(server_url + '?username=' + encodeURIComponent(username));

				if (ws !== null) {
					ws.onopen = function() {
						pubsub.publish('network-Open');
					};

					ws.onclose = function(e) {
						ws = null;
						pubsub.publish('network-Close');
					};

					ws.onmessage = function(e) {
						var data, data_length, i, command;

						try {
							data = JSON.parse(e.data);
							data_length = data.length;
							for (i = 0; i < data_length; i++) {
								command = data[i];
								command[0] = 'server-' + enums.CommandsToClient[command[0]];
								pubsub.publish.apply(null, command);
							}
						} catch (e) {
							console.log(e.stack);
						}

						pubsub.publish('network-MessageProcessingComplete');
					};

					ws.onerror = function(e) {
						pubsub.publish('network-Error');
					};
				}
			}
		},
		sendMessage = function() {
			if (ws !== null) {
				ws.send(JSON.stringify(Array.prototype.slice.call(arguments, 0)));
			}
		};

	initializeServerUrl();

	return {
		isBrowserSupported: isBrowserSupported,
		connect: connect,
		sendMessage: sendMessage
	};
});
