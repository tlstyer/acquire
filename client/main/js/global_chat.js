var common_data = require('./common_data'),
  common_functions = require('./common_functions'),
  enums = require('./enums'),
  network = require('./network'),
  pubsub = require('./pubsub'),
  current_page = null,
  show_on_game_page = false,
  page_to_position = {},
  new_messages_count = 0,
  add_client_location_messages = false,
  game_ids_with_changed_state = [];

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
  common_functions.setElementPosition($('#global-chat .chat-history'), left, top, width, height);
  common_functions.scrollToBottom($('#global-chat .chat-history'));

  common_functions.setElementPosition($('#global-chat .chat-history-new-messages'), left, top + height - 22, width - common_functions.getScrollbarWidth(), 22);

  top += height;
  height = 25;
  common_functions.setElementPosition($('#global-chat .chat-message'), left, top, width, height);
}

function setPage(page) {
  current_page = page;

  if (page === 'lobby' || (page === 'game' && show_on_game_page)) {
    setPosition();
    $('#global-chat').show();
  } else {
    $('#global-chat').hide();
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
  var $message = $('#global-chat .chat-message'),
    message = $message.val().replace(/\s+/g, ' ').trim();

  if (message.length > 0) {
    network.sendMessage(enums.CommandsToServer.SendGlobalChatMessage, message);
  }

  $message.val('');

  return false;
}

function appendElement($element) {
  var $chat_history = $('#global-chat .chat-history'),
    scroll_is_at_bottom = common_functions.isScrollAtBottom($chat_history);

  $chat_history.append($element);

  if (scroll_is_at_bottom) {
    common_functions.scrollToBottom($chat_history);
  } else {
    new_messages_count++;
    $element = $('#global-chat .chat-history-new-messages');
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
  var $chat_history = $('#global-chat .chat-history');

  if (common_functions.isScrollAtBottom($chat_history)) {
    new_messages_count = 0;
    $('#global-chat .chat-history-new-messages').hide();
  }
}

function addGlobalChatMessage(client_id, chat_message) {
  var $message = $('#chat-message').clone().removeAttr('id');

  $message.find('.username').text(common_data.client_id_to_data[client_id].username);
  $message.find('.chat-message-contents').text(chat_message);

  appendElement($message);
}

function compareFuncScoreboard(a, b) {
  var result = b[1] - a[1];

  if (result === 0) {
    result = a[0][0] - b[0][0];
  }

  return result;
}

function getUsernameSpanHtml(username) {
  return $('<span class="username"/>').text(username)[0].outerHTML;
}

function messageProcessingComplete() {
  var length,
    index,
    game_id,
    state_id,
    mode_id,
    number_of_players,
    score,
    player_data,
    message,
    scoreboard,
    i,
    parts,
    scoreboard_length,
    scoreboard_row,
    player_ids,
    subparts,
    num_player_ids,
    j;

  if (add_client_location_messages) {
    if (game_ids_with_changed_state.length > 0) {
      game_ids_with_changed_state = common_functions.arrayUnique(game_ids_with_changed_state);

      length = game_ids_with_changed_state.length;
      for (index = 0; index < length; index++) {
        game_id = game_ids_with_changed_state[index];
        state_id = common_data.game_id_to_state_id[game_id];
        mode_id = common_data.game_id_to_mode_id[game_id];
        number_of_players = common_data.game_id_to_number_of_players[game_id];
        score = common_data.game_id_to_score[game_id];
        player_data = common_data.game_id_to_player_data[game_id];

        message = 'Game #' + game_id + ': ' + common_functions.getGameStateText(game_id) + ', ';

        if (state_id === enums.GameStates.Completed) {
          scoreboard = [];
          if (mode_id === enums.GameModes.Singles) {
            for (i = 0; i < number_of_players; i++) {
              scoreboard.push([[i], score[i]]);
            }
          } else {
            scoreboard.push([[0, 2], score[0] + score[2]]);
            scoreboard.push([[1, 3], score[1] + score[3]]);
          }
          scoreboard.sort(compareFuncScoreboard);

          parts = [];
          scoreboard_length = scoreboard.length;
          for (i = 0; i < scoreboard_length; i++) {
            scoreboard_row = scoreboard[i];
            player_ids = scoreboard_row[0];

            subparts = [];
            num_player_ids = player_ids.length;
            for (j = 0; j < num_player_ids; j++) {
              subparts.push(getUsernameSpanHtml(player_data[player_ids[j]].username));
            }

            parts.push(subparts.join(' + ') + ': ' + scoreboard_row[1] * 100);
          }

          message += 'Score: ' + parts.join(', ');
        } else {
          parts = [];
          for (i = 0; i < number_of_players; i++) {
            parts.push(getUsernameSpanHtml(player_data[i].username));
          }
          message += 'Players: ' + parts.join(', ');
        }

        appendElement($('<div/>').html(message));
      }

      game_ids_with_changed_state = [];
    }
  } else {
    add_client_location_messages = true;

    game_ids_with_changed_state = [];
  }
}

function gameStateChanged(game_id) {
  game_ids_with_changed_state.push(game_id);
}

function addClientLocationMessage(template_selector, client_id) {
  var $message;

  if (add_client_location_messages) {
    $message = $(template_selector).clone().removeAttr('id');

    $message.find('.username').text(common_data.client_id_to_data[client_id].username);

    appendElement($message);
  }
}

function addClient(client_id) {
  addClientLocationMessage('#global-chat-add-client', client_id);
}

function removeClient(client_id) {
  addClientLocationMessage('#global-chat-remove-client', client_id);
}

function reset() {
  $('#global-chat .chat-history').empty();
  $('#global-chat .chat-history-new-messages').hide();

  add_client_location_messages = false;
}

function onInitializationComplete() {
  $('#global-chat .chat-history').scroll(chatHistoryScrolled);
  $('#global-chat .chat-form').submit(chatFormSubmitted);
}

pubsub.subscribe(enums.PubSub.Client_SetPage, setPage);
pubsub.subscribe(enums.PubSub.Server_AddGlobalChatMessage, addGlobalChatMessage);
pubsub.subscribe(enums.PubSub.Network_MessageProcessingComplete, messageProcessingComplete);
pubsub.subscribe(enums.PubSub.Client_SetGameState, gameStateChanged);
pubsub.subscribe(enums.PubSub.Client_SetGamePlayerJoin, gameStateChanged);
pubsub.subscribe(enums.PubSub.Client_AddClient, addClient);
pubsub.subscribe(enums.PubSub.Client_RemoveClient, removeClient);
pubsub.subscribe(enums.PubSub.Network_Disconnect, reset);
pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

module.exports = {
  setShowOnGamePage: setShowOnGamePage,
  setPositionForPage: setPositionForPage,
};
