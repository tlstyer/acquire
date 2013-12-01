define(function(require) {
	var pubsub = require('pubsub'),
		command_queue = [],
		processing_commands = false,
		processCommands = function() {
			var command_index = 0;

			if (processing_commands) {
				return;
			}
			processing_commands = true;

			while (true) {
				if (command_index < command_queue.length) {
					pubsub.publish.apply(null, command_queue[command_index]);
					command_index += 1;
				} else {
					break;
				}
			}

			command_queue.length = 0;

			processing_commands = false;
		};

	return {
		'enqueueCommands': function(commands) {
			[].push.apply(command_queue, commands);
			processCommands();
		}
	};
});
