define(function(require) {
	var pubsub = require('pubsub'),
		client_id_to_username = {};

	var set = function(client_id, username) {
			if (username === null) {
				delete client_id_to_username[client_id];
			} else {
				client_id_to_username[client_id] = username;
			}
		},
		get = function(client_id) {
			return client_id_to_username[client_id];
		};

	pubsub.subscribe('server-SetClientIdToUsername', set);

	return {
		get: get
	};
});
