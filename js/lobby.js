define(function(require) {
	var $ = require('jquery'),
		common_html = require('common_html'),
		pubsub = require('pubsub');

	var commandSetClientIdToGameId = function(client_id, game_id) {
			var $username;

			$('#client-' + client_id).remove();

			$username = $('<div id="client-' + client_id + '"/>').append(common_html.getUsernameElement(client_id));
			if (game_id === null) {
				// do nothing
			} else if (game_id === 0) {
				$('#clients-in-lobby').append($username);
			} else {
				$('#lobby-games').append($username);
			}
		};

	pubsub.subscribe('server-SetClientIdToGameId', commandSetClientIdToGameId);

	return null;
});
