define(function(require) {
	var enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		send_timeout_length = 20000,
		receive_timeout_length = 35000,
		send_timeout_id = null,
		receive_timeout_id = null,
		onSendTimeout = function() {
			network.sendMessage(enums.CommandsToServer.Heartbeat);
		},
		onReceiveTimeout = function() {
			network.close();
		},
		start = function() {
			send_timeout_id = setTimeout(onSendTimeout, send_timeout_length);
			receive_timeout_id = setTimeout(onReceiveTimeout, receive_timeout_length);
		},
		messageSent = function() {
			clearTimeout(send_timeout_id);
			send_timeout_id = setTimeout(onSendTimeout, send_timeout_length);
		},
		messageReceived = function() {
			clearTimeout(receive_timeout_id);
			receive_timeout_id = setTimeout(onReceiveTimeout, receive_timeout_length);
		},
		reset = function() {
			clearTimeout(send_timeout_id);
			send_timeout_id = null;
			clearTimeout(receive_timeout_id);
			receive_timeout_id = null;
		};

	pubsub.subscribe(enums.PubSub.Network_Open, start);
	pubsub.subscribe(enums.PubSub.Network_SendMessage, messageSent);
	pubsub.subscribe(enums.PubSub.Network_MessageProcessingComplete, messageReceived);
	pubsub.subscribe(enums.PubSub.Network_Close, reset);
	pubsub.subscribe(enums.PubSub.Network_Error, reset);
});
