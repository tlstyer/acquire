define(function(require) {
	'use strict';

	var enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		current_page = null,
		periodic_resize_check_width = null,
		periodic_resize_check_height = null,
		got_local_storage = window.hasOwnProperty('localStorage'),
		error_message_lookup = {};

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
		var username = $('#login-form-username').val().replace(/\s+/g, ' ').trim(),
			password = $('#login-form-password').val();

		if (username.length === 0 || username.length > 32) {
			setLoginErrorMessage(enums.Errors.InvalidUsername);
		} else {
			if (got_local_storage) {
				localStorage.username = username;
			}

			showPage('connecting');
			setLoginErrorMessage(enums.Errors.LostConnection);
			network.connect(username, password.length > 0 ? getPasswordHash(username, password) : '');
		}

		return false;
	}

	function onSubmitSetPasswordForm() {
		var username = $('#set-password-form-username').val().replace(/\s+/g, ' ').trim(),
			password = $('#set-password-form-password').val(),
			password_repeat = $('#set-password-form-password-repeat').val(),
			$inputs;

		if (username.length < 1 || username.length > 32) {
			setSetPasswordErrorMessage(enums.Errors.InvalidUsername);
		} else if (password.length < 8) {
			setSetPasswordErrorMessage(enums.Errors.InvalidPassword);
		} else if (password !== password_repeat) {
			setSetPasswordErrorMessage(enums.Errors.NonMatchingPasswords);
		} else {
			$inputs = $('#set-password-form input');
			$inputs.prop('disabled', true);

			$.ajax({
				type: 'POST',
				url: network.getServerUrl() + '/server/set-password',
				data: {
					version: $('#page-login').attr('data-version'),
					username: username,
					password: getPasswordHash(username, password)
				},
				success: function(data) {
					setSetPasswordErrorMessage(data);
				},
				error: function() {
					setSetPasswordErrorMessage(enums.Errors.GenericError);
				},
				complete: function() {
					$inputs.prop('disabled', false);
				},
				dataType: 'json'
			});
		}

		return false;
	}

	function getPasswordHash(username, password) {
		return CryptoJS.SHA256('acquire ' + username + ' ' + password).toString();
	}

	function onClientSetClientData() {
		showPage('lobby');
	}

	function initializeErrorMessageLookup() {
		error_message_lookup[enums.Errors.NotUsingLatestVersion] = 'You are not using the latest version. Please reload this page to get it!';
		error_message_lookup[enums.Errors.GenericError] = 'An error occurred during the processing of your request.';
		error_message_lookup[enums.Errors.InvalidUsername] = 'Invalid username. Username must have between 1 and 32 characters.';
		error_message_lookup[enums.Errors.InvalidPassword] = 'Invalid password. Password must have at least 8 characters.';
		error_message_lookup[enums.Errors.MissingPassword] = 'Password is required.';
		error_message_lookup[enums.Errors.ProvidedPassword] = 'Password is not set for this user.';
		error_message_lookup[enums.Errors.IncorrectPassword] = 'Password is incorrect.';
		error_message_lookup[enums.Errors.NonMatchingPasswords] = 'Password and Repeat Password must match.';
		error_message_lookup[enums.Errors.ExistingPassword] = 'Password already exists for this username.';
		error_message_lookup[enums.Errors.UsernameAlreadyInUse] = 'Username already in use.';
		error_message_lookup[enums.Errors.LostConnection] = 'Lost connection to the server.';
	}

	function setLoginErrorMessage(error_id) {
		var message;

		if (error_message_lookup.hasOwnProperty(error_id)) {
			message = error_message_lookup[error_id];
		} else {
			message = 'Unknown error.';
		}

		$('#login-error-message').html($('<p/>').text(message));
	}

	function setSetPasswordErrorMessage(error_id) {
		var message, $set_password_success_message = $('#set-password-success-message'),
			$set_password_error_message = $('#set-password-error-message');

		if (error_id === null) {
			$set_password_success_message.html($('<p/>').text('Success!'));
			$set_password_error_message.empty();
		} else {
			if (error_message_lookup.hasOwnProperty(error_id)) {
				message = error_message_lookup[error_id];
			} else {
				message = 'Unknown error.';
			}

			$set_password_success_message.empty();
			$set_password_error_message.html($('<p/>').text(message));
		}
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

	function onInitializationComplete() {
		periodicResizeCheck();
		initializeUsername();
		initializeErrorMessageLookup();
		showPage('login');

		$('#login-form').submit(onSubmitLoginForm);
		$('#set-password-form').submit(onSubmitSetPasswordForm);
	}

	require('lobby_page');
	require('game');

	pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
	pubsub.subscribe(enums.PubSub.Server_FatalError, setLoginErrorMessage);
	pubsub.subscribe(enums.PubSub.Client_SetOption, onClientSetOption);
	pubsub.subscribe(enums.PubSub.Client_JoinGame, onClientJoinGame);
	pubsub.subscribe(enums.PubSub.Client_LeaveGame, onClientLeaveGame);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, onNetworkDisconnect);
	pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

	$(function() {
		pubsub.publish(enums.PubSub.Client_InitializationComplete);
	});
});
