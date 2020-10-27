var common_functions = require('./common_functions'),
  enums = require('./enums'),
  pubsub = require('./pubsub'),
  server_url = null,
  version = null,
  socket = null;

function initializeServerUrlData() {
  var result = /^http(s?):\/\/([^\/]+)\//.exec(window.location.href);

  if (result !== null) {
    server_url = 'http' + result[1] + '://' + result[2];
  } else {
    server_url = 'http://127.0.0.1:9000';
  }

  version = $('#page-login').attr('data-version');
}

function getServerUrl() {
  return server_url;
}

function connect(username, password) {
  if (socket === null) {
    socket = new SockJS(server_url + '/sockjs');

    socket.onopen = function () {
      socket.send(JSON.stringify([version, username, password]));
    };

    socket.onclose = function () {
      socket = null;
      pubsub.publish(enums.PubSub.Network_Disconnect);
    };

    socket.onmessage = function (e) {
      var data = e.data,
        data_length,
        i;

      try {
        data = JSON.parse(data);
        data_length = data.length;
        for (i = 0; i < data_length; i++) {
          pubsub.publish.apply(null, data[i]);
        }

        pubsub.publish(enums.PubSub.Network_MessageProcessingComplete);
      } catch (e) {
        common_functions.reportError(e);

        socket.disconnect();
      }
    };
  }
}

function sendMessage() {
  if (socket !== null) {
    socket.send(JSON.stringify(Array.prototype.slice.call(arguments, 0)));
  }
}

function onInitializationComplete() {
  initializeServerUrlData();
}

pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

module.exports = {
  getServerUrl: getServerUrl,
  connect: connect,
  sendMessage: sendMessage,
};
