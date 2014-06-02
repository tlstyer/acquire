define(function(require) {
	var $ = require('jquery'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		show_page = function(page) {
			$('.page').hide();
			$('#' + page).show();
		};

	require('lobby');
	require('game');

	if (network.isBrowserSupported()) {
		show_page('connecting');

		network.connect();

		pubsub.subscribe('network-connected', function() {
			show_page('login');
		});
		pubsub.subscribe('network-disconnected', function() {
			show_page('disconnected');
		});
	} else {
		show_page('websocket-not-supported');
	}

	$('#login-form').submit(function() {
		network.sendMessage(enums.CommandsToServer.SetUsername, $('#login-form-username').val());
		show_page('lobby');

		return false;
	});
});
