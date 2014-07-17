define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		current_page = null,
		page_to_position = {},
		setPosition = function() {
			var position = page_to_position[current_page],
				left, top, width, height;

			left = position.left;
			top = position.top;
			width = position.width;
			height = position.height - 25;
			common_functions.setElementPosition($('#chat-history'), left, top, width, height);

			top += height;
			if (current_page === 'game') {
				width = position.width - 80;
			}
			height = 25;
			common_functions.setElementPosition($('#chat-input'), left, top, width, height);

			if (current_page === 'game') {
				left += width + 2;
				width = position.width - width - 2;
				common_functions.setElementPosition($('#chat-game-checkbox-div'), left, top, width, height);
				$('#chat-game-checkbox-div').show();
			} else {
				$('#chat-game-checkbox-div').hide();
			}
		},
		setPage = function(page) {
			current_page = page;

			if (page === 'lobby' || page === 'game') {
				setPosition();
				$('#chat').show();
			} else {
				$('#chat').hide();
			}
		},
		setPositionForPage = function(page, left, top, width, height) {
			page_to_position[page] = {
				left: left,
				top: top,
				width: width,
				height: height
			};

			if (page === current_page) {
				setPosition();
			}
		},
		submitChatInput = function() {
			var $input = $('#chat-input'),
				input = $input.val().replace(/\s+/g, ' ').trim(),
				command;

			if (input.length > 0) {
				if (current_page === 'game' && $('#chat-game-checkbox').prop('checked')) {
					command = enums.CommandsToServer.SendGameChatMessage;
				} else {
					command = enums.CommandsToServer.SendGlobalChatMessage;
				}

				network.sendMessage(command, input);
			}

			$input.val('');

			return false;
		},
		appendElement = function($element, client_id) {
			var $chat_history = $('#chat-history'),
				scroll_is_at_bottom = common_functions.isScrollAtBottom($chat_history),
				$username = $element.find('.username');

			if (client_id === common_data.client_id) {
				$username.removeClass('username');
				$username.text('You');
			} else {
				$username.text(common_data.client_id_to_data[client_id].username);
			}

			$chat_history.append($element);

			if (scroll_is_at_bottom) {
				common_functions.scrollToBottom($chat_history);
			}
		},
		addGlobalChatMessage = function(client_id, chat_message) {
			var $message = $('#chat-message-global').clone().removeAttr('id');

			$message.find('.chat-message-global-contents').text(chat_message);

			appendElement($message, client_id);
		},
		addGameChatMessage = function(client_id, chat_message) {
			var $message = $('#chat-message-game').clone().removeAttr('id');

			$message.find('.chat-message-game-contents').text(chat_message);

			appendElement($message, client_id);
		},
		add_client_location_messages = false,
		messageProcessingComplete = function() {
			add_client_location_messages = true;
		},
		addClientLocationMessage = function(template_selector, client_id, game_id) {
			var $message;

			if (add_client_location_messages) {
				$message = $(template_selector).clone().removeAttr('id');

				if (game_id !== null) {
					$message.find('.game-id').text(game_id);
				}

				appendElement($message, client_id);
			}
		},
		addClient = function(client_id) {
			addClientLocationMessage('#chat-add-client', client_id, null);
		},
		removeClient = function(client_id) {
			addClientLocationMessage('#chat-remove-client', client_id, null);
		},
		addGamePlayer = function(game_id, client_id) {
			addClientLocationMessage('#chat-add-game-player', client_id, game_id);
		},
		removeGamePlayer = function(game_id, client_id) {
			addClientLocationMessage('#chat-remove-game-player', client_id, game_id);
		},
		addGameWatcher = function(game_id, client_id) {
			addClientLocationMessage('#chat-add-game-watcher', client_id, game_id);
		},
		removeGameWatcher = function(game_id, client_id) {
			addClientLocationMessage('#chat-remove-game-watcher', client_id, game_id);
		},
		reset = function() {
			$('#chat-history').empty();

			add_client_location_messages = false;
		};

	$('#chat-input-form').submit(submitChatInput);

	pubsub.subscribe('client-SetPage', setPage);
	pubsub.subscribe('server-AddGlobalChatMessage', addGlobalChatMessage);
	pubsub.subscribe('server-AddGameChatMessage', addGameChatMessage);
	pubsub.subscribe('network-MessageProcessingComplete', messageProcessingComplete);
	pubsub.subscribe('client-AddClient', addClient);
	pubsub.subscribe('client-RemoveClient', removeClient);
	pubsub.subscribe('client-AddGamePlayer', addGamePlayer);
	pubsub.subscribe('client-RemoveGamePlayer', removeGamePlayer);
	pubsub.subscribe('client-AddGameWatcher', addGameWatcher);
	pubsub.subscribe('client-RemoveGameWatcher', removeGameWatcher);
	pubsub.subscribe('network-Close', reset);
	pubsub.subscribe('network-Error', reset);

	return {
		setPositionForPage: setPositionForPage
	};
});
