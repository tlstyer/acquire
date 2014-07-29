define(function() {
	var type_to_subscribers = {};

	function publish(type) {
		var subscribers = type_to_subscribers.hasOwnProperty(type) ? type_to_subscribers[type] : [],
			i, length = subscribers.length,
			args = Array.prototype.slice.call(arguments, 1);

		for (i = 0; i < length; i++) {
			subscribers[i].apply(null, args);
		}
	}

	function subscribe(type, fn) {
		if (!type_to_subscribers.hasOwnProperty(type)) {
			type_to_subscribers[type] = [];
		}
		type_to_subscribers[type].push(fn);
	}

	return {
		publish: publish,
		subscribe: subscribe
	};
});
