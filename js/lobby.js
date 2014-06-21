define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
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
		updateGameStateAndLinks = function(game_id) {
			var $lobby_section = $('#lobby-game-' + game_id),
				state_id = common_data.game_id_to_game_state[game_id],
				player_data = null,
				player_id = null,
				client_username = common_data.client_id_to_data[common_data.client_id].username,
				in_this_game = false,
				show_join_link = true,
				show_rejoin_link = true,
				show_watch_link = true;

			// create and add lobby section if it doesn't exist
			if ($lobby_section.length === 0) {
				$lobby_section = $('#lobby-game-template').clone();
				$lobby_section.attr('id', 'lobby-game-' + game_id);
				$lobby_section.attr('data-game-id', game_id);
				$lobby_section.find('.header').text('Game #' + game_id);
				$lobby_section.show();
				$('#lobby-games').append($lobby_section);
			}

			// set game state text
			if (state_id === enums.GameStates.Starting) {
				$lobby_section.find('.state').text('Starting');
			} else if (state_id === enums.GameStates.InProgress) {
				$lobby_section.find('.state').text('In Progress');
			} else if (state_id === enums.GameStates.Completed) {
				$lobby_section.find('.state').text('Completed');
			}

			// is client's username in this game?
			player_data = common_data.game_id_to_player_data[game_id];
			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id)) {
					if (player_data[player_id].username === client_username) {
						in_this_game = true;
					}
				}
			}

			// determine what links to show
			if (state_id === enums.GameStates.Starting) {
				if (in_this_game) {
					show_join_link = false;
					show_rejoin_link = true;
					show_watch_link = false;
				} else {
					show_join_link = true;
					show_rejoin_link = false;
					show_watch_link = true;
				}
			} else {
				if (in_this_game) {
					show_join_link = false;
					show_rejoin_link = true;
					show_watch_link = false;
				} else {
					show_join_link = false;
					show_rejoin_link = false;
					show_watch_link = true;
				}
			}

			// show/hide links
			if (show_join_link) {
				$lobby_section.find('.join-link').show();
			} else {
				$lobby_section.find('.join-link').hide();
			}

			if (show_rejoin_link) {
				$lobby_section.find('.rejoin-link').show();
			} else {
				$lobby_section.find('.rejoin-link').hide();
			}

			if (show_watch_link) {
				$lobby_section.find('.watch-link').show();
			} else {
				$lobby_section.find('.watch-link').hide();
			}
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			var $player = $('#lobby-game-' + game_id + ' .player:eq(' + player_id + ')');
			$player.text(username);
			$player.addClass('missing');
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			var $player = $('#lobby-game-' + game_id + ' .player:eq(' + player_id + ')');

			if (client_id === null) {
				$player.addClass('missing');
			} else {
				$('#clients-in-lobby .client-' + client_id).remove();

				$player.text(common_data.client_id_to_data[client_id].username);
				$player.removeClass('missing');
			}
		},
		setGameWatcherClientId = function(game_id, client_id) {
			$('#clients-in-lobby .client-' + client_id).remove();
			$('<div/>').attr('class', 'client-' + client_id).text(common_data.client_id_to_data[client_id].username).appendTo('#lobby-game-' + game_id + ' .watchers');
		},
		returnWatcherToLobby = function(game_id, client_id) {
			$('#lobby-game-' + game_id + ' .watchers .client-' + client_id).remove();
			clientLeftGame(client_id);
		},
		resetHtml = function() {
			$('#clients-in-lobby').empty();
			$('#lobby-games').empty();
		};

	pubsub.subscribe('server-SetClientIdToData', setClientIdToData);
	pubsub.subscribe('client-ClientLeftGame', clientLeftGame);
	pubsub.subscribe('client-UpdateGameState', updateGameStateAndLinks);
	pubsub.subscribe('client-UpdateGamePlayer', updateGameStateAndLinks);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);
	pubsub.subscribe('server-SetGameWatcherClientId', setGameWatcherClientId);
	pubsub.subscribe('server-ReturnWatcherToLobby', returnWatcherToLobby);
	pubsub.subscribe('network-close', resetHtml);

	$('#create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame);

		return false;
	});

	$('#lobby-games').on('click', 'a', function() {
		var $this = $(this),
			game_id = parseInt($this.closest('.lobby-section').attr('data-game-id'), 10);

		if ($(this).hasClass('join-link')) {
			network.sendMessage(enums.CommandsToServer.JoinGame, game_id);
		} else if ($(this).hasClass('rejoin-link')) {
			network.sendMessage(enums.CommandsToServer.RejoinGame, game_id);
		} else if ($(this).hasClass('watch-link')) {
			network.sendMessage(enums.CommandsToServer.WatchGame, game_id);
		}

		return false;
	});

	return null;
});
