define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_html = require('common_html'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub');

	var commandCreateGame = function(game_id) {
			var $lobby_section = $('<div class="lobby-section" id="lobby-game-' + game_id + '"><div class="header">Game #' + game_id + '</div></div>');
			$('#lobby-games').append($lobby_section);
		},
		commandSetClientIdToGameId = function(client_id, game_id) {
			var $username;

			$('#client-' + client_id).remove();

			$username = $('<div id="client-' + client_id + '"/>').append(common_html.getUsernameElement(client_id));
			if (game_id === null) {
				// do nothing
			} else if (game_id === 0) {
				$('#clients-in-lobby').append($username);
			} else {
				$('#lobby-game-' + game_id).append($username);
			}

			if (client_id === common_data.client_id) {
				if (game_id === 0) {
					$('#lobby-section-create-game').show();
				} else {
					$('#lobby-section-create-game').hide();
				}
			}
		};

	pubsub.subscribe('server-CreateGame', commandCreateGame);
	pubsub.subscribe('server-SetClientIdToGameId', commandSetClientIdToGameId);

	$('#create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame);

		return false;
	});

	return null;
});
