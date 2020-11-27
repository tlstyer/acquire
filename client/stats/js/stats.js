$(function () {
  var rating_types = ['Singles2', 'Singles3', 'Singles4', 'Teams'],
    game_mode_id_to_name = {
      1: 'Singles',
      2: 'Teams',
    };

  function reportAjaxError(jqXHR, textStatus, errorThrown) {
    $.post('/server/report-error', {
      message: 'stats.js ajax error',
      trace: JSON.stringify({
        jqXHR: jqXHR,
        textStatus: textStatus,
        errorThrown: errorThrown,
      }),
    });
  }

  function initialize() {
    if (document.readyState === 'complete' && typeof $ !== 'undefined' && typeof History !== 'undefined') {
      initializeHistory();

      History.Adapter.bind(window, 'statechange', onStateChange);

      $('#form input[type=button]').click(formButtonClicked);
      $('#form').submit(formSubmitted);
      $('#users, #games').on('click', 'tr :nth-child(2)', nameCellClicked);

      showPage('stats');
    } else {
      setTimeout(initialize, 10);
    }
  }

  function getQueryStringParams() {
    var qs_parts = window.location.search.substring(1).replace('+', ' ').split('&'),
      qs_parts_length = qs_parts.length,
      parts,
      i,
      key,
      value,
      params = {};

    for (i = 0; i < qs_parts_length; i++) {
      parts = qs_parts[i].split('=');
      key = decodeURIComponent(parts[0]);
      value = decodeURIComponent(parts.slice(1).join('='));
      params[key] = value;
    }

    return params;
  }

  function initializeHistory() {
    var params = getQueryStringParams(),
      state = null;

    if (params.hasOwnProperty('ratings')) {
      state = getRatingsHistoryParams(params.ratings);
    } else if (params.hasOwnProperty('username')) {
      state = getUsernameHistoryParams(params.username);
    }

    if (state !== null) {
      History.replaceState.apply(History, state);
      onStateChange();
    }
  }

  function setFormErrorMessage(message) {
    $('#form-error-message').text(message === null ? '' : message);
  }

  function setFormLoadingMessage(message) {
    $('#form input').prop('disabled', message !== null);
    $('#form-loading-message').text(message === null ? '' : message);
  }

  function formatDate(unix_timestamp) {
    var date_obj = new Date(unix_timestamp * 1000),
      year = date_obj.getUTCFullYear(),
      month = date_obj.getUTCMonth() + 1,
      day = date_obj.getUTCDate(),
      hour = date_obj.getUTCHours(),
      minute = date_obj.getUTCMinutes(),
      second = date_obj.getUTCSeconds(),
      date = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day,
      time = (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute + ':' + (second < 10 ? '0' : '') + second;

    return date + ' ' + time;
  }

  function populateRatingsTable(ratings) {
    var $tbody = $('#users tbody'),
      ratings_index,
      ratings_length = ratings.length,
      rating,
      $tr;

    $tbody.empty();

    for (ratings_index = 0; ratings_index < ratings_length; ratings_index++) {
      rating = ratings[ratings_index];

      $tr = $('<tr/>');
      $tr.append($('<td/>').text(ratings_index + 1));
      $tr.append($('<td/>').text(rating[0]));
      $tr.append($('<td/>').text((rating[2] - rating[3] * 3).toFixed(2)));
      $tr.append($('<td/>').text(rating[2].toFixed(2) + ' ± ' + (rating[3] * 3).toFixed(2)));
      $tr.append($('<td/>').text(rating[4]));
      $tr.append($('<td/>').text(formatDate(rating[1])));
      $tbody.append($tr);
    }
  }

  function populateSummary(ratings) {
    var $tbody = $('#user-summary tbody'),
      rating_type_index,
      rating_type,
      rating,
      $tr;

    $tbody.empty();

    for (rating_type_index = 0; rating_type_index < rating_types.length; rating_type_index++) {
      rating_type = rating_types[rating_type_index];

      if (ratings.hasOwnProperty(rating_type)) {
        rating = ratings[rating_type];

        $tr = $('<tr/>');
        $tr.append($('<td/>').text(rating_type));
        $tr.append($('<td/>').text((rating[1] - rating[2] * 3).toFixed(2)));
        $tr.append($('<td/>').text(rating[1].toFixed(2) + ' ± ' + (rating[2] * 3).toFixed(2)));
        $tr.append(
          $('<td/>').text(
            rating[3].reduce(function (a, b) {
              return a + b;
            })
          )
        );
        $tr.append($('<td/>').text(rating[3].join(' - ')));
        $tr.append($('<td/>').text(formatDate(rating[0])));
        $tbody.append($tr);
      }
    }
  }

  function compareScores(a, b) {
    return b[1] - a[1];
  }

  function getRanks(game_mode_name, scores) {
    var data = [],
      num_scores,
      score_index,
      data_length,
      data_index,
      ranks = [];

    if (game_mode_name === 'Teams') {
      data.push([0, scores[0][1] + scores[2][1]]);
      data.push([1, scores[1][1] + scores[3][1]]);
    } else {
      num_scores = scores.length;
      for (score_index = 0; score_index < num_scores; score_index++) {
        data.push([score_index, scores[score_index][1]]);
      }
    }

    data.sort(compareScores);

    data_length = data.length;
    for (data_index = 0; data_index < data_length; data_index++) {
      ranks.push(0);
    }

    ranks[data[0][0]] = 1;
    for (data_index = 1; data_index < data_length; data_index++) {
      if (data[data_index][1] === data[data_index - 1][1]) {
        ranks[data[data_index][0]] = ranks[data[data_index - 1][0]];
      } else {
        ranks[data[data_index][0]] = data_index + 1;
      }
    }

    if (game_mode_name === 'Teams') {
      ranks.push(ranks[0]);
      ranks.push(ranks[1]);
    }

    return ranks;
  }

  function populateGames(games, games_username) {
    var $games = $('#games'),
      game_index,
      game,
      $div,
      game_mode_name,
      $table,
      $tbody,
      scores,
      num_scores,
      ranks,
      score_index,
      score,
      $tr;

    $('#games-header').text(games.length === 100 ? 'Last 100 Games' : 'Games');

    $games.empty();

    for (game_index = 0; game_index < games.length; game_index++) {
      game = games[game_index];

      $div = $('<div/>');
      game_mode_name = game_mode_id_to_name[game[0]];
      $div.text(game_mode_name + ' ' + formatDate(game[1]));
      $games.append($div);

      $table = $('<table/>');
      $div.append($table);
      $tbody = $('<tbody/>');
      $table.append($tbody);

      scores = game[2];
      num_scores = scores.length;
      ranks = getRanks(game_mode_name, scores);
      for (score_index = 0; score_index < num_scores; score_index++) {
        score = scores[score_index];

        $tr = $('<tr/>');
        if (score[0] === games_username) {
          $tr.addClass('current_user');
        }
        $tr.append($('<td/>').text(ranks[score_index]));
        $tr.append($('<td/>').text(score[0]));
        $tr.append($('<td/>').text(score[1] * 100));
        if (game_mode_name === 'Teams') {
          $tr.append($('<td/>').text((score[1] + scores[(score_index + 2) % 4][1]) * 100));
        }
        $tbody.append($tr);
      }
    }
  }

  function formButtonClicked() {
    /* jshint validthis:true */
    var rating_type = $(this).val();

    History.pushState.apply(History, getRatingsHistoryParams(rating_type));
  }

  function getRatingsHistoryParams(rating_type) {
    return [
      {
        ratings: rating_type,
      },
      document.title,
      '?ratings=' + rating_type,
    ];
  }

  var showRatings_data = null;
  function showRatings(rating_type) {
    if (showRatings_data) {
      showData();
    } else {
      $.ajax({
        url: 'data/ratings.json',
        success: function (data) {
          showRatings_data = data;
          showData();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          reportAjaxError(jqXHR, textStatus, errorThrown);

          showPage('loading-error');
        },
        dataType: 'json',
      });
    }

    function showData() {
      if (showRatings_data.hasOwnProperty(rating_type)) {
        $('#user').hide();
        $('#users').show();
        $('#ratings-type').text(rating_type);
        populateRatingsTable(showRatings_data[rating_type]);
        setFormErrorMessage(null);
      } else {
        setFormErrorMessage('Invalid ratings type.');
      }
    }
  }

  function formSubmitted() {
    var username = $('#form-username').val().replace(/\s+/g, ' ').trim();

    History.pushState.apply(History, getUsernameHistoryParams(username));

    return false;
  }

  function getUsernameHistoryParams(username) {
    return [
      {
        username: username,
      },
      document.title,
      '?username=' + encodeURIComponent(username),
    ];
  }

  function showUsername(username) {
    if (isValidUsername(username)) {
      setFormLoadingMessage('Loading stats for ' + username + '...');
      setFormErrorMessage(null);

      $.ajax({
        url: 'data/users/' + btoa(username).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') + '.json',
        success: function (data) {
          $('#users').hide();
          $('#user').show();
          $('#user-name').text(username);
          populateSummary(data.ratings);
          populateGames(data.games, username);
        },
        error: function () {
          setFormErrorMessage('Cannot find ' + username + '.');
        },
        complete: function () {
          setFormLoadingMessage(null);
        },
        dataType: 'json',
      });
    } else {
      setFormErrorMessage('Invalid username.');
    }
  }

  function showNothing() {
    $('#user').hide();
    $('#users').hide();
  }

  function onStateChange() {
    var state = History.getState(),
      data = state.data;

    if (data.hasOwnProperty('ratings')) {
      showRatings(data.ratings);
    } else if (data.hasOwnProperty('username')) {
      showUsername(data.username);
    } else {
      showNothing();
    }
  }

  function nameCellClicked() {
    /* jshint validthis:true */
    window.scrollTo(0, 0);
    $('#form-username').val($(this).text());
    formSubmitted();
  }

  function showPage(page) {
    $('.page').hide();
    $('#page-' + page).show();
  }

  function isValidUsername(username) {
    var i, char_code;

    if (username.length === 0 || username.length > 32) {
      return false;
    }

    for (i = 0; i < username.length; i++) {
      char_code = username.charCodeAt(i);
      if (char_code < 32 || char_code > 126) {
        return false;
      }
    }
    return true;
  }

  window.onerror = function (message, file, line_number) {
    $.post('/server/report-error', {
      message: message,
      trace: file + ':' + line_number,
    });
  };

  initialize();
});
