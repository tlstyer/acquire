define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_html = require('common_html'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub');

	var setClientIdToData = function(client_id, username, ip_and_port) {
			if (username === null) {
				$('#clients-in-lobby .client-' + client_id).remove();
			} else {
				$('<div/>').attr('class', 'client-' + client_id).text(username).appendTo('#clients-in-lobby');
			}
		},
		clientLeftGame = function(client_id) {
			$('<div/>').attr('class', 'client-' + client_id).text(common_data.client_id_to_data[client_id].username).appendTo('#clients-in-lobby');
		},
		setGameState = function(game_id, state_id) {
			if (state_id === enums.GameStates.PreGame) {
				var $lobby_section = $('#lobby-game-template').clone();
				$lobby_section.attr('id', 'lobby-game-' + game_id);
				$lobby_section.find('.header').text('Game #' + game_id);
				$lobby_section.show();
				$('#lobby-games').append($lobby_section);
			}
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			var $player = $('#lobby-game-' + game_id).find('.player:eq(' + player_id + ')');
			$player.text(username);
			$player.addClass('missing');
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			var $player = $('#lobby-game-' + game_id).find('.player:eq(' + player_id + ')');

			if (client_id === null) {
				$player.addClass('missing');
			} else {
				$('#clients-in-lobby .client-' + client_id).remove();

				$player.text(common_data.client_id_to_data[client_id].username);
				$player.removeClass('missing');
			}
		};

	pubsub.subscribe('server-SetClientIdToData', setClientIdToData);
	pubsub.subscribe('client-ClientLeftGame', clientLeftGame);
	pubsub.subscribe('server-SetGameState', setGameState);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);

	$('#create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame);

		return false;
	});

	return null;
});
