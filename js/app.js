define(function(require) {
	var display = require('display'),
		command_publisher = require('command_publisher'),
		ws = null;

	if ('WebSocket' in window) {
		ws = new WebSocket('ws://localhost:9000');
	} else {
		alert('Browser does not support WebSocket!');
	}

	if (ws !== null) {
		ws.onopen = function() {};

		ws.onclose = function(e) {
			// log('Connection closed (wasClean = ' + e.wasClean + ', code = ' + e.code + ', reason = ' + e.reason + ')');
			ws = null;
		};

		ws.onmessage = function(e) {
			var data;

			try {
				data = JSON.parse(e.data);
				command_publisher.enqueueCommands(data);
			} catch (e) {}
		};
	}
});
