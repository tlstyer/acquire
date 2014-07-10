define(function(require) {
	var type_to_subscribers = {},
		publish = function(type) {
			var subscribers = type_to_subscribers.hasOwnProperty(type) ? type_to_subscribers[type] : [],
				i, length = subscribers.length,
				args = Array.prototype.slice.call(arguments, 1);

			for (i = 0; i < length; i++) {
				subscribers[i].apply(null, args);
			}
		},
		subscribe = function(type, fn) {
			if (!type_to_subscribers.hasOwnProperty(type)) {
				type_to_subscribers[type] = [];
			}
			type_to_subscribers[type].push(fn);
		};

	return {
		publish: publish,
		subscribe: subscribe
	};
});
