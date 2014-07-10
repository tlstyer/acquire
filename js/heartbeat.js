define(function(require) {
	var enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		send_timeout_length = 20000,
		receive_timeout_length = 30000,
		send_timeout_id = null,
		receive_timeout_id = null,
		onSendTimeout = function() {
			network.sendMessage(enums.CommandsToServer.Heartbeat);
		},
		onReceiveTimeout = function() {
			network.close();
		},
		onOpen = function() {
			send_timeout_id = setTimeout(onSendTimeout, send_timeout_length);
			receive_timeout_id = setTimeout(onReceiveTimeout, receive_timeout_length);
		},
		onSendMessage = function() {
			clearTimeout(send_timeout_id);
			send_timeout_id = setTimeout(onSendTimeout, send_timeout_length);
		},
		onMessageProcessingComplete = function() {
			clearTimeout(receive_timeout_id);
			receive_timeout_id = setTimeout(onReceiveTimeout, receive_timeout_length);
		},
		onClose = function() {
			clearTimeout(send_timeout_id);
			send_timeout_id = null;
			clearTimeout(receive_timeout_id);
			receive_timeout_id = null;
		};

	pubsub.subscribe('network-Open', onOpen);
	pubsub.subscribe('network-SendMessage', onSendMessage);
	pubsub.subscribe('network-MessageProcessingComplete', onMessageProcessingComplete);
	pubsub.subscribe('network-Close', onClose);
	pubsub.subscribe('network-Error', onClose);
});
