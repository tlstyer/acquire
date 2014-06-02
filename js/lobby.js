define(function(require) {
	var $ = require('jquery'),
		common_html = require('common_html'),
		pubsub = require('pubsub');

	var commandSetClientIdToRoom = function(client_id, room) {
			var $username, message;

			$username = common_html.getUsernameElement(client_id);
			if (room === null) {
				message = ' has left.';
			} else if (room === 0) {
				message = ' has entered the lobby.';
			} else {
				message = ' has entered room #' + room + '.';
			}

			$('<div/>').append($username).append(message).appendTo('#lobby');
		};

	pubsub.subscribe('server-SetClientIdToRoom', commandSetClientIdToRoom);

	return null;
});
