$(function() {
	'use strict';

	var user_id_to_username = null,
		username_to_user_id = null,
		rating_type_to_ratings = null,
		rating_type_to_dygraph = {
			Singles2: null,
			Singles3: null,
			Singles4: null,
			Teams: null
		},
		game_mode_id_to_name = {
			1: 'Singles',
			2: 'Teams'
		},
		games, games_length, games_num_shown;

	function initializeUsers() {
		$.ajax({
			url: 'stats/users.json',
			success: function(data) {
				var user_id;

				user_id_to_username = data.users;
				username_to_user_id = {};
				for (user_id in user_id_to_username) {
					if (user_id_to_username.hasOwnProperty(user_id)) {
						username_to_user_id[user_id_to_username[user_id]] = parseInt(user_id, 10);
					}
				}

				rating_type_to_ratings = data.ratings;

				setFormLoadingMessage(null);
			},
			dataType: 'json'
		});
	}

	function setFormErrorMessage(message) {
		$('#stats-form-error-message').text(message === null ? '' : message);
	}

	function setFormLoadingMessage(message) {
		$('#stats-form input').prop('disabled', message !== null);
		$('#stats-form-loading-message').text(message === null ? '' : message);
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
		var $tbody = $('#stats-users tbody'),
			ratings_index, ratings_length = ratings.length,
			rating, $tr;

		$tbody.empty();

		for (ratings_index = 0; ratings_index < ratings_length; ratings_index++) {
			rating = ratings[ratings_index];

			$tr = $('<tr/>');
			$tr.append($('<td/>').text(ratings_index + 1));
			$tr.append($('<td/>').text(user_id_to_username[rating[0]]));
			$tr.append($('<td/>').text((rating[2] - rating[3] * 3).toFixed(2)));
			$tr.append($('<td/>').text(rating[2].toFixed(2) + ' ± ' + (rating[3] * 3).toFixed(2)));
			$tr.append($('<td/>').text(rating[4]));
			$tr.append($('<td/>').text(formatDate(rating[1])));
			$tbody.append($tr);
		}
	}

	function populateRatings(ratings) {
		var rating_type, $rating, data, data_length, data_index, datum, dygraph_data;

		for (rating_type in rating_type_to_dygraph) {
			if (rating_type_to_dygraph.hasOwnProperty(rating_type)) {
				$rating = $('#stats-rating-' + rating_type);

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

					rating_type_to_dygraph[rating_type] = new Dygraph(document.getElementById('stats-rating-' + rating_type), dygraph_data, {
						title: rating_type,
						labels: ['Date', 'Rating']
					});
				} else {
					$rating.hide();
				}
			}
		}
	}

	function showMoreGames(num_games_to_add) {
		var $games = $('#stats-games'),
			game_index, game_index_cutoff = Math.min(games_num_shown + num_games_to_add, games_length),
			game, $div, game_mode_name, $table, $tbody, scores, num_scores, score_index, score, $tr, games_num_remaining, $stats_games_show_next_100 = $('#stats-games-show-next-100'),
			$stats_games_show_remaining = $('#stats-games-show-remaining');

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
			num_scores = game[2].length;
			for (score_index = 0; score_index < num_scores; score_index++) {
				score = scores[score_index];

				$tr = $('<tr/>');
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

	function populateGames(games_data) {
		games = games_data;
		games_length = games_data.length;
		games_num_shown = 0;

		$('#stats-games').empty();
		showMoreGames(100);
	}

	function formButtonClicked() {
		/* jshint validthis:true */
		var rating_type = $(this).val();

		$('#stats-user').hide();
		$('#stats-users').show();
		$('#stats-ratings-type').text(rating_type);
		populateRatingsTable(rating_type_to_ratings[rating_type]);
	}

	function formSubmitted() {
		var username = $('#stats-form-username').val().replace(/\s+/g, ' ').trim();

		if (username_to_user_id.hasOwnProperty(username)) {
			setFormLoadingMessage('Loading stats for ' + username + '...');
			setFormErrorMessage(null);

			$.ajax({
				url: 'stats/user' + username_to_user_id[username] + '.json',
				success: function(data) {
					$('#stats-users').hide();
					$('#stats-user').show();
					$('#stats-user-name').text(username);
					populateRatings(data.ratings);
					populateGames(data.games);
				},
				error: function() {
					setFormErrorMessage('Error while loading stats for ' + username + '.');
				},
				complete: function() {
					setFormLoadingMessage(null);
				},
				dataType: 'json'
			});
		} else {
			setFormErrorMessage('Cannot find ' + username + '.');
		}

		return false;
	}

	function nameCellClicked() {
		/* jshint validthis:true */
		window.scrollTo(0, 0);
		$('#stats-form-username').val($(this).text());
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

	initializeUsers();

	$('#stats-form input[type=button]').click(formButtonClicked);
	$('#stats-form').submit(formSubmitted);
	$('#stats-users').on('click', 'tr td:nth-child(2)', nameCellClicked);
	$('#stats-games').on('click', 'tr td:nth-child(1)', nameCellClicked);
	$('#stats-games-show-next-100').click(showNext100Clicked);
	$('#stats-games-show-remaining').click(showRemainingClicked);
});
