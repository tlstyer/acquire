$(function () {
  var user_id_to_username = null,
    username_to_user_id = null,
    rating_type_to_ratings = null,
    rating_types = ['Singles2', 'Singles3', 'Singles4', 'Teams'],
    rating_type_to_dygraph = {
      Singles2: null,
      Singles3: null,
      Singles4: null,
      Teams: null,
    },
    game_mode_id_to_name = {
      1: 'Singles',
      2: 'Teams',
    },
    games_user_id,
    games,
    games_length,
    games_num_shown;

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
    $.ajax({
      url: 'data/ratings.json',
      success: function (data) {
        rating_type_to_ratings = data;

        completeInitializationWhenReady();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        reportAjaxError(jqXHR, textStatus, errorThrown);

        showPage('loading-error');
      },
      dataType: 'json',
    });
  }

  function completeInitializationWhenReady() {
    if (document.readyState === 'complete' && typeof $ !== 'undefined' && typeof Dygraph !== 'undefined' && typeof History !== 'undefined') {
      initializeHistory();

      History.Adapter.bind(window, 'statechange', onStateChange);

      $('#form input[type=button]').click(formButtonClicked);
      $('#form').submit(formSubmitted);
      $('#users, #games').on('click', 'tr :nth-child(2)', nameCellClicked);
      $('#games-show-next-100').click(showNext100Clicked);
      $('#games-show-remaining').click(showRemainingClicked);

      showPage('stats');
    } else {
      setTimeout(completeInitializationWhenReady, 10);
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

  function formatDateMilliseconds(unix_timestamp_milliseconds) {
    return formatDate(unix_timestamp_milliseconds / 1000);
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

  function compareFuncResults(a, b) {
    return b[1] - a[1];
  }

  function getRecords(user_id, games) {
    var records,
      game_index,
      games_length = games.length,
      game,
      game_mode_name,
      player_data,
      player_data_length,
      rating_type,
      results,
      player_index,
      player_datum,
      team_index,
      results_length,
      last_score,
      score,
      rank;

    records = {
      Singles2: [0, 0],
      Singles3: [0, 0, 0],
      Singles4: [0, 0, 0, 0],
      Teams: [0, 0],
    };

    for (game_index = 0; game_index < games_length; game_index++) {
      game = games[game_index];
      game_mode_name = game_mode_id_to_name[game[0]];
      player_data = game[2];
      player_data_length = player_data.length;
      rating_type = game_mode_name === 'Singles' ? game_mode_name + player_data_length : game_mode_name;

      if (player_data_length === 1 || player_data_length > 4) {
        continue;
      }

      if (rating_type === 'Teams') {
        results = [
          [0, 0],
          [0, 0],
        ];
        for (player_index = 0; player_index < player_data_length; player_index++) {
          player_datum = player_data[player_index];
          team_index = player_index % 2;

          if (player_datum[0] === user_id) {
            results[team_index][0] = user_id;
          }
          results[team_index][1] += player_datum[1];
        }
      } else {
        results = player_data.slice(0);
      }

      results.sort(compareFuncResults);
      results_length = results.length;

      last_score = -1;
      for (player_index = 0; player_index < results_length; player_index++) {
        player_datum = results[player_index];
        score = player_datum[1];

        if (score !== last_score) {
          rank = player_index;
          last_score = score;
        }

        if (player_datum[0] === user_id) {
          records[rating_type][rank]++;
          break;
        }
      }
    }

    return records;
  }

  function populateSummary(user_id, ratings, games) {
    var $tbody = $('#user-summary tbody'),
      records,
      rating_type_index,
      rating_types_length = rating_types.length,
      rating_type,
      num_ratings,
      rating,
      $tr;

    $tbody.empty();

    records = getRecords(user_id, games);

    for (rating_type_index = 0; rating_type_index < rating_types_length; rating_type_index++) {
      rating_type = rating_types[rating_type_index];

      if (ratings.hasOwnProperty(rating_type)) {
        num_ratings = ratings[rating_type].length;
        rating = ratings[rating_type][num_ratings - 1];

        $tr = $('<tr/>');
        $tr.append($('<td/>').text(rating_type));
        $tr.append($('<td/>').text((rating[1] - rating[2] * 3).toFixed(2)));
        $tr.append($('<td/>').text(rating[1].toFixed(2) + ' ± ' + (rating[2] * 3).toFixed(2)));
        $tr.append($('<td/>').text(num_ratings - 1));
        $tr.append($('<td/>').text(records[rating_type].join(' - ')));
        $tr.append($('<td/>').text(formatDate(rating[0])));
        $tbody.append($tr);
      }
    }
  }

  function populateRatings(ratings) {
    var rating_type_index,
      rating_types_length = rating_types.length,
      rating_type,
      $rating,
      data,
      data_length,
      data_index,
      datum,
      dygraph_data;

    for (rating_type_index = 0; rating_type_index < rating_types_length; rating_type_index++) {
      rating_type = rating_types[rating_type_index];

      if (rating_type_to_dygraph.hasOwnProperty(rating_type)) {
        $rating = $('#rating-' + rating_type);

        if (ratings.hasOwnProperty(rating_type)) {
          $rating.show();

          data = ratings[rating_type];
          data_length = data.length;
          dygraph_data = [];
          for (data_index = 0; data_index < data_length; data_index++) {
            datum = data[data_index];
            dygraph_data.push([new Date(datum[0] * 1000), datum[1] - datum[2] * 3]);
          }

          if (rating_type_to_dygraph[rating_type] !== null) {
            rating_type_to_dygraph[rating_type].destroy();
            rating_type_to_dygraph[rating_type] = null;
          }

          rating_type_to_dygraph[rating_type] = new Dygraph(document.getElementById('rating-' + rating_type), dygraph_data, {
            title: rating_type,
            labels: ['Date', 'Rating'],
            labelsUTC: true,
            axes: {
              x: {
                valueFormatter: formatDateMilliseconds,
              },
            },
          });
        } else {
          $rating.hide();
        }
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

  function showMoreGames(num_games_to_add) {
    var $games = $('#games'),
      game_index,
      game_index_cutoff = Math.min(games_num_shown + num_games_to_add, games_length),
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
      $tr,
      games_num_remaining,
      $stats_games_show_next_100 = $('#games-show-next-100'),
      $stats_games_show_remaining = $('#games-show-remaining');

    for (game_index = games_num_shown; game_index < game_index_cutoff; game_index++) {
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
        if (score[0] === games_user_id) {
          $tr.addClass('current_user');
        }
        $tr.append($('<td/>').text(ranks[score_index]));
        $tr.append($('<td/>').text(user_id_to_username[score[0]]));
        $tr.append($('<td/>').text(score[1] * 100));
        if (game_mode_name === 'Teams') {
          $tr.append($('<td/>').text((score[1] + scores[(score_index + 2) % 4][1]) * 100));
        }
        $tbody.append($tr);
      }
    }

    games_num_shown = game_index_cutoff;

    games_num_remaining = games_length - games_num_shown;
    if (games_num_remaining > 100) {
      $stats_games_show_next_100.show();
    } else {
      $stats_games_show_next_100.hide();
    }
    if (games_num_remaining > 0) {
      $stats_games_show_remaining.show();
    } else {
      $stats_games_show_remaining.hide();
    }
  }

  function populateGames(user_id, games_data) {
    games_user_id = user_id;
    games = games_data;
    games_length = games_data.length;
    games_num_shown = 0;

    $('#games').empty();
    showMoreGames(100);
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

  function showRatings(rating_type) {
    if (rating_type_to_ratings.hasOwnProperty(rating_type)) {
      $('#user').hide();
      $('#users').show();
      $('#ratings-type').text(rating_type);
      populateRatingsTable(rating_type_to_ratings[rating_type]);
      setFormErrorMessage(null);
    } else {
      setFormErrorMessage('Invalid ratings type.');
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
    var user_id;

    if (username_to_user_id.hasOwnProperty(username)) {
      user_id = username_to_user_id[username];
      setFormLoadingMessage('Loading stats for ' + username + '...');
      setFormErrorMessage(null);

      $.ajax({
        url: 'data/user' + user_id + '.json',
        success: function (data) {
          $('#users').hide();
          $('#user').show();
          $('#user-name').text(username);
          populateSummary(user_id, data.ratings, data.games);
          populateRatings(data.ratings);
          populateGames(user_id, data.games);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          reportAjaxError(jqXHR, textStatus, errorThrown);
          setFormErrorMessage('Error while loading stats for ' + username + '.');
        },
        complete: function () {
          setFormLoadingMessage(null);
        },
        dataType: 'json',
      });
    } else {
      setFormErrorMessage('Cannot find ' + username + '.');
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

  function showNext100Clicked() {
    showMoreGames(100);
    return false;
  }

  function showRemainingClicked() {
    showMoreGames(games_length - games_num_shown);
    return false;
  }

  function showPage(page) {
    $('.page').hide();
    $('#page-' + page).show();
  }

  window.onerror = function (message, file, line_number) {
    $.post('/server/report-error', {
      message: message,
      trace: file + ':' + line_number,
    });
  };

  initialize();
});
