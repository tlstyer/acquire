var common_data = require('./common_data'),
    common_functions = require('./common_functions'),
    enums = require('./enums'),
    network = require('./network'),
    pubsub = require('./pubsub'),
    current_page = null,
    show_on_game_page = false,
    page_to_position = {},
    new_messages_count = 0;

function setPosition() {
    var position = page_to_position[current_page],
        left,
        top,
        width,
        height;

    left = position.left;
    top = position.top;
    width = position.width;
    height = position.height - 25;
    common_functions.setElementPosition($('#game-chat .chat-history'), left, top, width, height);
    common_functions.scrollToBottom($('#game-chat .chat-history'));

    common_functions.setElementPosition($('#game-chat .chat-history-new-messages'), left, top + height - 22, width - common_functions.getScrollbarWidth(), 22);

    top += height;
    height = 25;
    common_functions.setElementPosition($('#game-chat .chat-message'), left, top, width, height);
}

function setPage(page) {
    current_page = page;

    if (page === 'game' && show_on_game_page) {
        setPosition();
        $('#game-chat').show();
    } else {
        $('#game-chat').hide();
    }
}

function setShowOnGamePage(show) {
    show_on_game_page = show;

    if (current_page === 'game') {
        setPage(current_page);
    }
}

function setPositionForPage(page, left, top, width, height) {
    page_to_position[page] = {
        left: left,
        top: top,
        width: width,
        height: height,
    };

    if (page === current_page) {
        setPosition();
    }
}

function chatFormSubmitted() {
    var $message = $('#game-chat .chat-message'),
        message = $message
            .val()
            .replace(/\s+/g, ' ')
            .trim();

    if (message.length > 0) {
        network.sendMessage(enums.CommandsToServer.SendGameChatMessage, message);
    }

    $message.val('');

    return false;
}

function appendElement($element) {
    var $chat_history = $('#game-chat .chat-history'),
        scroll_is_at_bottom = common_functions.isScrollAtBottom($chat_history);

    $chat_history.append($element);

    if (scroll_is_at_bottom) {
        common_functions.scrollToBottom($chat_history);
    } else {
        new_messages_count++;
        $element = $('#game-chat .chat-history-new-messages');
        if (new_messages_count === 1) {
            $element.find('.singular').show();
            $element.find('.plural').hide();
        } else {
            $element.find('.message-count').text(new_messages_count);
            $element.find('.singular').hide();
            $element.find('.plural').show();
        }
        $element.show();
    }
}

function chatHistoryScrolled() {
    var $chat_history = $('#game-chat .chat-history');

    if (common_functions.isScrollAtBottom($chat_history)) {
        new_messages_count = 0;
        $('#game-chat .chat-history-new-messages').hide();
    }
}

function addGameChatMessage(client_id, chat_message) {
    var $message = $('#chat-message')
        .clone()
        .removeAttr('id');

    $message.find('.username').text(common_data.client_id_to_data[client_id].username);
    $message.find('.chat-message-contents').text(chat_message);

    appendElement($message);
}

function addClientLocationMessage(template_selector, client_id, game_id) {
    var $message;

    if (game_id === common_data.game_id && client_id !== common_data.client_id) {
        $message = $(template_selector)
            .clone()
            .removeAttr('id');

        $message.find('.username').text(common_data.client_id_to_data[client_id].username);

        appendElement($message);
    }
}

function addGamePlayer(game_id, player_id, client_id) {
    addClientLocationMessage('#game-chat-add-game-player', client_id, game_id);
}

function removeGamePlayer(game_id, player_id, client_id) {
    addClientLocationMessage('#game-chat-remove-game-player', client_id, game_id);
}

function addGameWatcher(game_id, client_id) {
    addClientLocationMessage('#game-chat-add-game-watcher', client_id, game_id);
}

function removeGameWatcher(game_id, client_id) {
    addClientLocationMessage('#game-chat-remove-game-watcher', client_id, game_id);
}

function reset() {
    $('#game-chat .chat-history').empty();
    $('#game-chat .chat-history-new-messages').hide();
}

function onInitializationComplete() {
    $('#game-chat .chat-history').scroll(chatHistoryScrolled);
    $('#game-chat .chat-form').submit(chatFormSubmitted);
}

pubsub.subscribe(enums.PubSub.Client_SetPage, setPage);
pubsub.subscribe(enums.PubSub.Server_AddGameChatMessage, addGameChatMessage);
pubsub.subscribe(enums.PubSub.Client_LeaveGame, reset);
pubsub.subscribe(enums.PubSub.Client_SetGamePlayerJoin, addGamePlayer);
pubsub.subscribe(enums.PubSub.Client_SetGamePlayerRejoin, addGamePlayer);
pubsub.subscribe(enums.PubSub.Client_SetGamePlayerLeave, removeGamePlayer);
pubsub.subscribe(enums.PubSub.Client_AddGameWatcher, addGameWatcher);
pubsub.subscribe(enums.PubSub.Client_RemoveGameWatcher, removeGameWatcher);
pubsub.subscribe(enums.PubSub.Network_Disconnect, reset);
pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

module.exports = {
    setShowOnGamePage: setShowOnGamePage,
    setPositionForPage: setPositionForPage,
};
