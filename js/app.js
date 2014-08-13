define(function(require) {
	'use strict';

	var enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		current_page = null,
		periodic_resize_check_width = null,
		periodic_resize_check_height = null,
		got_local_storage = window.hasOwnProperty('localStorage');

	function showPage(page) {
		if (page !== current_page) {
			$('.page').hide();
			$('#page-' + page).show();

			if (page === 'login') {
				$('#login-form-username').focus();
			}

			current_page = page;

			pubsub.publish(enums.PubSub.Client_SetPage, page);
		}
	}

	function periodicResizeCheck() {
		var width = $(window).width(),
			height = $(window).height();

		if (width !== periodic_resize_check_width || height !== periodic_resize_check_height) {
			periodic_resize_check_width = width;
			periodic_resize_check_height = height;
			pubsub.publish(enums.PubSub.Client_Resize, width, height);
		}

		setTimeout(periodicResizeCheck, 500);
	}

	function initializeUsername() {
		var username;

		if (got_local_storage) {
			username = localStorage.username;
			if (username !== undefined) {
				$('#login-form-username').val(username);
			}
		}
	}

	function onSubmitLoginForm() {
		var username = $('#login-form-username').val().replace(/\s+/g, ' ').trim();

		if (username.length === 0 || username.length > 32) {
			onServerFatalError(enums.FatalErrors.InvalidUsername);
		} else {
			if (got_local_storage) {
				localStorage.username = username;
			}

			showPage('connecting');
			$('#login-error-message').html($('<p/>').text('Lost connection to the server.'));
			network.connect(username);
		}

		return false;
	}

	function onClientSetClientData() {
		showPage('lobby');
	}

	function onServerFatalError(fatal_error_id) {
		var message;

		if (fatal_error_id === enums.FatalErrors.NotUsingLatestVersion) {
			message = 'You are not using the latest version. Please reload this page to get it!';
		} else if (fatal_error_id === enums.FatalErrors.InvalidUsername) {
			message = 'Invalid username. Username must have between 1 and 32 characters.';
		} else if (fatal_error_id === enums.FatalErrors.UsernameAlreadyInUse) {
			message = 'Username already in use.';
		} else {
			message = 'Unknown error.';
		}

		$('#login-error-message').html($('<p/>').text(message));
	}

	function onClientSetOption(key, value) {
		if (key === 'enable-high-contrast-colors') {
			if (value) {
				$('body').addClass('high-contrast');
			} else {
				$('body').removeClass('high-contrast');
			}
		}
	}

	function onClientJoinGame() {
		showPage('game');
	}

	function onClientLeaveGame() {
		showPage('lobby');
	}

	function onNetworkDisconnect() {
		showPage('login');
	}

	require('lobby');
	require('game');

	periodicResizeCheck();
	initializeUsername();
	showPage('login');

	$('#login-form').submit(onSubmitLoginForm);

	pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
	pubsub.subscribe(enums.PubSub.Server_FatalError, onServerFatalError);
	pubsub.subscribe(enums.PubSub.Client_SetOption, onClientSetOption);
	pubsub.subscribe(enums.PubSub.Client_JoinGame, onClientJoinGame);
	pubsub.subscribe(enums.PubSub.Client_LeaveGame, onClientLeaveGame);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, onNetworkDisconnect);

	pubsub.publish(enums.PubSub.Client_InitializationComplete);
});
