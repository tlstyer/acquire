define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_html = require('common_html'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub');

	var commandCreateGame = function(game_id) {
			var $lobby_section = $('#lobby-game-template').clone();
			$lobby_section.attr('id', 'lobby-game-' + game_id);
			$lobby_section.find('.header').text('Game #' + game_id);
			$lobby_section.show();
			$('#lobby-games').append($lobby_section);
		},
		commandSetGamePlayerUsername = function(game_id, player_id, username) {
			var $player = $('#lobby-game-' + game_id).find('.player').eq(player_id);
			$player.text(username);
		},
		commandSetGamePlayerClientId = function(game_id, player_id, client_id) {
			var $player = $('#lobby-game-' + game_id).find('.player').eq(player_id);
			if (client_id === null) {
				$player.addClass('missing');
			} else {
				$player.removeClass('missing');
			}
		};

	pubsub.subscribe('server-CreateGame', commandCreateGame);
	pubsub.subscribe('server-SetGamePlayerUsername', commandSetGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', commandSetGamePlayerClientId);

	$('#create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame);

		return false;
	});

	return null;
});
