define(function(require) {
	var pubsub = require('pubsub'),
		data = {
			client_id: null,
			client_id_to_username: {}
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
		};

	pubsub.subscribe('server-SetClientId', setClientId);
	pubsub.subscribe('server-SetClientIdToUsername', setClientIdToUsername);

	return data;
});
