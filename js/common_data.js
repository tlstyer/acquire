define(function(require) {
	var pubsub = require('pubsub'),
		data = {
			client_id: null,
			client_id_to_username: {},
			game_id_to_player_data: {}
		};

	var setClientId = function(client_id) {
			data.client_id = client_id;
		},
		setClientIdToUsername = function(client_id, username) {
			if (username === null) {
				delete data.client_id_to_username[client_id];
			} else {
				data.client_id_to_username[client_id] = username;
			}
		},
		createGame = function(game_id) {
			data.game_id_to_player_data[game_id] = {};
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
					username: data.client_id_to_username[client_id],
					client_id: client_id
				};
			}
		};

	pubsub.subscribe('server-SetClientId', setClientId);
	pubsub.subscribe('server-SetClientIdToUsername', setClientIdToUsername);
	pubsub.subscribe('server-CreateGame', createGame);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);

	return data;
});
