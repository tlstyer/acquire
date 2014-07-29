define(function(require) {
	var common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		current_page = null,
		page_to_position = {},
		new_messages_count = 0,
		add_client_location_messages = false;

	function setPosition() {
		var position = page_to_position[current_page],
			left, top, width, height;

		left = position.left;
		top = position.top;
		width = position.width;
		height = position.height - 25;
		common_functions.setElementPosition($('#chat-history'), left, top, width, height);
		common_functions.scrollToBottom($('#chat-history'));

		common_functions.setElementPosition($('#chat-history-new-messages'), left, top + height - 22, width - common_functions.getScrollbarWidth(), 22);

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
	}

	function setPage(page) {
		current_page = page;

		if (page === 'lobby' || page === 'game') {
			setPosition();
			$('#chat').show();
		} else {
			$('#chat').hide();
		}
	}

	function setPositionForPage(page, left, top, width, height) {
		page_to_position[page] = {
			left: left,
			top: top,
			width: width,
			height: height
		};

		if (page === current_page) {
			setPosition();
		}
	}

	function submitChatInput() {
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
	}

	function appendElement($element, client_id) {
		var $chat_history = $('#chat-history'),
			scroll_is_at_bottom = common_functions.isScrollAtBottom($chat_history);

		$element.find('.username').text(common_data.client_id_to_data[client_id].username);

		$chat_history.append($element);

		if (scroll_is_at_bottom) {
			common_functions.scrollToBottom($chat_history);
		} else {
			new_messages_count++;
			$element = $('#chat-history-new-messages');
			if (new_messages_count === 1) {
				$element.find('.singular').show();
				$element.find('.plural').hide();
			} else {
				$element.find('.message-count').text(new_messages_count);
				$element.find('.singular').hide();
				$element.find('.plural').show();
			}
			$element.show();
		}
	}

	function chatHistoryScrolled() {
		var $chat_history = $('#chat-history');

		if (common_functions.isScrollAtBottom($chat_history)) {
			new_messages_count = 0;
			$('#chat-history-new-messages').hide();
		}
	}

	function addGlobalChatMessage(client_id, chat_message) {
		var $message = $('#chat-message-global').clone().removeAttr('id');

		$message.find('.chat-message-global-contents').text(chat_message);

		appendElement($message, client_id);
	}

	function addGameChatMessage(client_id, chat_message) {
		var $message = $('#chat-message-game').clone().removeAttr('id');

		$message.find('.chat-message-game-contents').text(chat_message);

		appendElement($message, client_id);
	}

	function messageProcessingComplete() {
		add_client_location_messages = true;
	}

	function addClientLocationMessage(template_selector, client_id, game_id) {
		var $message;

		if (add_client_location_messages) {
			$message = $(template_selector).clone().removeAttr('id');

			if (game_id !== null) {
				$message.find('.game-id').text(game_id);
			}

			appendElement($message, client_id);
		}
	}

	function addClient(client_id) {
		addClientLocationMessage('#chat-add-client', client_id, null);
	}

	function removeClient(client_id) {
		addClientLocationMessage('#chat-remove-client', client_id, null);
	}

	function addGamePlayer(game_id, client_id) {
		addClientLocationMessage('#chat-add-game-player', client_id, game_id);
	}

	function removeGamePlayer(game_id, client_id) {
		addClientLocationMessage('#chat-remove-game-player', client_id, game_id);
	}

	function addGameWatcher(game_id, client_id) {
		addClientLocationMessage('#chat-add-game-watcher', client_id, game_id);
	}

	function removeGameWatcher(game_id, client_id) {
		addClientLocationMessage('#chat-remove-game-watcher', client_id, game_id);
	}

	function reset() {
		$('#chat-history').empty();
		$('#chat-history-new-messages').hide();

		add_client_location_messages = false;
	}

	$('#chat-history').scroll(chatHistoryScrolled);
	$('#chat-input-form').submit(submitChatInput);

	pubsub.subscribe(enums.PubSub.Client_SetPage, setPage);
	pubsub.subscribe(enums.PubSub.Server_AddGlobalChatMessage, addGlobalChatMessage);
	pubsub.subscribe(enums.PubSub.Server_AddGameChatMessage, addGameChatMessage);
	pubsub.subscribe(enums.PubSub.Network_MessageProcessingComplete, messageProcessingComplete);
	pubsub.subscribe(enums.PubSub.Client_AddClient, addClient);
	pubsub.subscribe(enums.PubSub.Client_RemoveClient, removeClient);
	pubsub.subscribe(enums.PubSub.Client_AddGamePlayer, addGamePlayer);
	pubsub.subscribe(enums.PubSub.Client_RemoveGamePlayer, removeGamePlayer);
	pubsub.subscribe(enums.PubSub.Client_AddGameWatcher, addGameWatcher);
	pubsub.subscribe(enums.PubSub.Client_RemoveGameWatcher, removeGameWatcher);
	pubsub.subscribe(enums.PubSub.Network_Close, reset);
	pubsub.subscribe(enums.PubSub.Network_Error, reset);

	return {
		setPositionForPage: setPositionForPage
	};
});
