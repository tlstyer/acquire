define(function(require) {
	var $ = require('jquery'),
		client_id_to_username = require('client_id_to_username'),
		pubsub = require('pubsub');

	var commandSetClientIdToRoom = function(client_id, room) {
			var message = client_id_to_username.get(client_id);
			if (room === null) {
				message += ' has left.';
			} else if (room === 0) {
				message += ' has entered the lobby.';
			} else {
				message += ' has entered room #' + room + '.';
			}

			$('<div/>').text(message).appendTo('#lobby');
		};

	pubsub.subscribe('server-SetClientIdToRoom', commandSetClientIdToRoom);

	return null;
});
