define(function(require) {
	var pubsub = require('pubsub'),
		data = {
			client_id: null,
			game_id: null,
			client_id_to_data: {},
			game_id_to_game_state: {},
			game_id_to_player_data: {},
			game_id_to_watcher_client_ids: {}
		};

	var setClientId = function(client_id) {
			data.client_id = client_id;
		},
		setClientIdToData = function(client_id, username, ip_and_port) {
			if (username === null) {
				delete data.client_id_to_data[client_id];
			} else {
				data.client_id_to_data[client_id] = {
					username: username,
					ip_and_port: ip_and_port
				};
			}
		},
		setGameState = function(game_id, state_id) {
			data.game_id_to_game_state[game_id] = state_id;
			if (!data.game_id_to_player_data.hasOwnProperty(game_id)) {
				data.game_id_to_player_data[game_id] = {};
			}

			pubsub.publish('client-UpdateGameState', game_id);
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			data.game_id_to_player_data[game_id][player_id] = {
				username: username,
				client_id: null
			};

			pubsub.publish('client-UpdateGamePlayer', game_id);
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			var client_id_left_game;

			if (client_id === null) {
				client_id_left_game = data.game_id_to_player_data[game_id][player_id].client_id;
				if (client_id_left_game === data.client_id) {
					data.game_id = null;
				}
				data.game_id_to_player_data[game_id][player_id].client_id = null;
				pubsub.publish('client-ClientLeftGame', client_id_left_game);
			} else {
				data.game_id_to_player_data[game_id][player_id] = {
					username: data.client_id_to_data[client_id].username,
					client_id: client_id
				};
			}

			if (client_id === data.client_id) {
				if (game_id !== data.game_id) {
					data.game_id = game_id;
					pubsub.publish('client-JoinGame');
				}
			}

			pubsub.publish('client-UpdateGamePlayer', game_id);
		},
		setGameWatcherClientId = function(game_id, client_id) {
			if (!data.game_id_to_watcher_client_ids.hasOwnProperty(game_id)) {
				data.game_id_to_watcher_client_ids[game_id] = [];
			}
			data.game_id_to_watcher_client_ids[game_id].push(client_id);

			if (client_id === data.client_id) {
				data.game_id = game_id;
				pubsub.publish('client-JoinGame');
			}
		},
		returnWatcherToLobby = function(game_id, client_id) {
			var client_ids = data.game_id_to_watcher_client_ids[game_id];
			data.game_id_to_watcher_client_ids[game_id] = client_ids.splice(client_ids.indexOf(client_id), 1);

			if (client_id === data.client_id) {
				data.game_id = null;
			}
		};

	pubsub.subscribe('server-SetClientId', setClientId);
	pubsub.subscribe('server-SetClientIdToData', setClientIdToData);
	pubsub.subscribe('server-SetGameState', setGameState);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);
	pubsub.subscribe('server-SetGameWatcherClientId', setGameWatcherClientId);
	pubsub.subscribe('server-ReturnWatcherToLobby', returnWatcherToLobby);

	return data;
});
