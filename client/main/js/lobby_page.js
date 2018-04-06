var global_chat = require('./global_chat'),
    enums = require('./enums'),
    lobby = require('./lobby'),
    options = require('./options'),
    pubsub = require('./pubsub');

function resize(window_width, window_height) {
    var half_window_width = Math.floor(window_width / 2),
        left,
        top,
        width,
        height;

    lobby.setPositionForPage('lobby', 0, 0, half_window_width, window_height);

    left = half_window_width + 2;
    top = 0;
    width = window_width - half_window_width - 2;
    height = 220;
    options.setPositionForPage('lobby', left, top, width, height);

    top += height;
    height = window_height - top;
    global_chat.setPositionForPage('lobby', left, top, width, height);
}

pubsub.subscribe(enums.PubSub.Client_Resize, resize);
