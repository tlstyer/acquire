define(function(require) {
	var $ = require('jquery'),
		common_html = require('common_html'),
		pubsub = require('pubsub');

	var commandSetClientIdToRoom = function(client_id, room) {
			var $username;

			$('#client-' + client_id).remove();

			$username = $('<div id="client-' + client_id + '"/>').append(common_html.getUsernameElement(client_id));
			if (room === null) {
				// do nothing
			} else if (room === 0) {
				$('#clients-in-lobby').append($username);
			} else {
				$('#lobby-games').append($username);
			}
		};

	pubsub.subscribe('server-SetClientIdToRoom', commandSetClientIdToRoom);

	return null;
});
