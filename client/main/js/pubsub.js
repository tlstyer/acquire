var enums = require('./enums'),
  id_to_subscribers = [];

function initialize() {
  var id;

  for (id = 0; id < enums.PubSub.Max; id++) {
    id_to_subscribers.push([]);
  }
}

function publish(id) {
  var subscribers = id_to_subscribers[id],
    i,
    length = subscribers.length,
    args = Array.prototype.slice.call(arguments, 1);

  for (i = 0; i < length; i++) {
    subscribers[i].apply(null, args);
  }
}

function subscribe(id, fn) {
  id_to_subscribers[id].push(fn);
}

initialize();

module.exports = {
  publish: publish,
  subscribe: subscribe,
};
