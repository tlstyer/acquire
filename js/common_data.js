define(function(require) {
	var enums = require('enums'),
		pubsub = require('pubsub'),
		data = {
			client_id: null,
			game_id: null,
			client_id_to_data: {},
			game_id_to_player_data: {}
		};

	var setClientId = function(client_id) {
			data.client_id = client_id;
		},
		SetClientIdToData = function(client_id, username, ip_and_port) {
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
			if (state_id === enums.GameStates.PreGame) {
				data.game_id_to_player_data[game_id] = {};
			}
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			data.game_id_to_player_data[game_id][player_id] = {
				username: username,
				client_id: null
			};
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			if (client_id === null) {
				data.game_id_to_player_data[game_id][player_id].client_id = null;
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
		};

	pubsub.subscribe('server-SetClientId', setClientId);
	pubsub.subscribe('server-SetClientIdToData', SetClientIdToData);
	pubsub.subscribe('server-SetGameState', setGameState);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);

	return data;
});
