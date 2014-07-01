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
				top, height;

			top = position.top;
			height = position.height - 25;
			common_functions.setElementPosition($('#chat-history'), position.left, top, position.width, height);

			top += height;
			height = 25;
			common_functions.setElementPosition($('#chat-input'), position.left, top, position.width, height);
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
			var $input = $('#chat-input');

			network.sendMessage(enums.CommandsToServer.SendChatMessage, $input.val());
			$input.val('');

			return false;
		},
		addChatMessage = function(client_id, chat_message) {
			var $message = $('#chat-message').clone().removeAttr('id'),
				$chat_history = $('#chat-history'),
				scroll_is_at_bottom = common_functions.isScrollAtBottom($chat_history);

			$message.find('.username').text(common_data.client_id_to_data[client_id].username);
			$message.find('.message').text(chat_message);

			$chat_history.append($message);

			if (scroll_is_at_bottom) {
				common_functions.scrollToBottom($chat_history);
			}
		};

	pubsub.subscribe('client-SetPage', setPage);
	pubsub.subscribe('server-AddChatMessage', addChatMessage);

	$('#chat-input-form').submit(submitChatInput);

	return {
		setPositionForPage: setPositionForPage
	};
});
