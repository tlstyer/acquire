define(function(require) {
	var $ = require('jquery'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		current_page = null,
		showPage = function(page) {
			if (page !== current_page) {
				$('.page').hide();
				$('#page-' + page).show();

				current_page = page;

				pubsub.publish('client-SetPage', page);
			}
		},
		checkBrowserSupport = function() {
			if (network.isBrowserSupported()) {
				showPage('login');
			} else {
				showPage('websocket-not-supported');
			}
		},
		periodic_resize_check_width = null,
		periodic_resize_check_height = null,
		periodicResizeCheck = function() {
			var width = $(window).width(),
				height = $(window).height();

			if (width !== periodic_resize_check_width || height !== periodic_resize_check_height) {
				periodic_resize_check_width = width;
				periodic_resize_check_height = height;
				pubsub.publish('client-Resize', width, height);
			}

			setTimeout(periodicResizeCheck, 500);
		},
		onSubmitLoginForm = function() {
			showPage('connecting');
			$('#login-error-message').empty();
			network.connect($('#login-form-username').val());

			return false;
		},
		onClientSetClientData = function() {
			showPage('lobby');
		},
		onServerFatalError = function(fatal_error_id) {
			var message;

			if (fatal_error_id === enums.FatalErrors.NotUsingLatestVersion) {
				message = 'You are not using the latest version. Please reload this page to get it!';
			} else if (fatal_error_id === enums.FatalErrors.InvalidUsername) {
				message = 'Invalid username.';
			} else if (fatal_error_id === enums.FatalErrors.UsernameAlreadyInUse) {
				message = 'Username already in use.';
			} else {
				message = 'Unknown error.';
			}

			$('#login-error-message').html($('<p>').text(message));
		},
		onClientJoinGame = function() {
			showPage('game');
		},
		onClientLeaveGame = function() {
			showPage('lobby');
		},
		onNetworkClose = function() {
			showPage('login');
		},
		onNetworkError = function() {
			$('#login-error-message').html($('<p>').text('Could not connect to the server.'));
			showPage('login');
		};

	require('heartbeat');
	require('lobby');
	require('game');

	checkBrowserSupport();
	periodicResizeCheck();

	$('#login-form').submit(onSubmitLoginForm);

	pubsub.subscribe('client-SetClientData', onClientSetClientData);
	pubsub.subscribe('server-FatalError', onServerFatalError);
	pubsub.subscribe('client-JoinGame', onClientJoinGame);
	pubsub.subscribe('client-LeaveGame', onClientLeaveGame);
	pubsub.subscribe('network-Close', onNetworkClose);
	pubsub.subscribe('network-Error', onNetworkError);
});
