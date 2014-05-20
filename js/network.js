define(function(require) {
	var ws = null,
		command_publisher = require('command_publisher'),
		isBrowserSupported = function() {
			return 'WebSocket' in window;
		},
		connect = function() {
			if (isBrowserSupported()) {
				ws = new WebSocket('ws://localhost:9000');

				if (ws !== null) {
					ws.onopen = function() {
						command_publisher.enqueueCommands([
							['network-connected']
						]);
					};

					ws.onclose = function(e) {
						ws = null;
						command_publisher.enqueueCommands([
							['network-disconnected']
						]);
					};

					ws.onmessage = function(e) {
						var data;

						try {
							data = JSON.parse(e.data);
							command_publisher.enqueueCommands(data);
						} catch (e) {}
					};
				}
			}
		},
		sendMessage = function() {
			if (ws !== null) {
				ws.send(JSON.stringify(Array.prototype.slice.call(arguments, 0)));
			}
		};

	return {
		isBrowserSupported: isBrowserSupported,
		connect: connect,
		sendMessage: sendMessage
	};
});
