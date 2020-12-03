import base64
import collections
import glob
import orm
import os
import os.path
import sqlalchemy.orm
import sqlalchemy.sql
import sqlalchemy.types
import subprocess
import time
import traceback
import trueskill
import ujson
import util


class Logs2DB:
    rating_type_to_draw_probability = {
        "Singles2": 0.00271,
        "Singles3": 0.00421,
        "Singles4": 0.01664,
        "Teams": 0.00221,
    }

    def __init__(self, session, lookup):
        self.session = session
        self.lookup = lookup
        self.trueskill_environment_lookup = {}
        self.completed_game_users = None

        self.method_lookup = {
            "game": self.process_game,
            "game-player": self.process_game_player,
            "game-result": self.process_game_result,
        }

    def process_logs(self, file, log_time=None):
        len_last_line = 0
        self.completed_game_users = set()
        for line in file:
            if line and line[-1] == "\n":
                if line[0] == "{":
                    params = ujson.decode(line)
                    if "log-time" not in params:
                        params["log-time"] = log_time
                    method = self.method_lookup.get(params.get("_"))
                    if method:
                        method(params)
            else:
                len_last_line = len(line.encode())
        return file.tell() - len_last_line, self.completed_game_users

    def process_game(self, params):
        game = self.lookup.get_game(params["log-time"], params["game-id"])

        begin_time = params.get("begin")
        if begin_time:
            game.begin_time = begin_time

        end_time = params.get("end")
        if end_time:
            game.end_time = end_time

        game.game_state = self.lookup.get_game_state(params["state"])

        game_mode = params.get("mode")
        if game_mode:
            game.game_mode = self.lookup.get_game_mode(game_mode)

        score = params.get("score")
        if score:
            params["scores"] = score
            self.process_game_result(params)

    def process_game_player(self, params):
        game = self.lookup.get_game(params["log-time"], params["game-id"])
        game_player = self.lookup.get_game_player(game, params["player-id"])
        game_player.user = self.lookup.get_user(params["username"])

    def process_game_result(self, params):
        game = self.lookup.get_game(params["log-time"], params["game-id"])

        game_players = []
        for player_index, score in enumerate(params["scores"]):
            game_player = self.lookup.get_game_player(game, player_index)
            game_player.score = score
            game_players.append(game_player)
            self.completed_game_users.add(game_player.user)

        self.calculate_new_ratings(game, game_players)

    def calculate_new_ratings(self, game, game_players):
        game_mode_name = game.game_mode.name
        num_players = len(game_players)
        if game_mode_name == "Teams":
            rating_type = self.lookup.get_rating_type("Teams")
        elif game_mode_name == "Singles" and 2 <= num_players <= 4:
            rating_type = self.lookup.get_rating_type("Singles" + str(num_players))
        else:
            return

        trueskill_ratings = []
        for game_player in game_players:
            rating = self.lookup.get_rating(game_player.user, rating_type)
            if not rating:
                rating = orm.Rating(
                    user=game_player.user,
                    rating_type=rating_type,
                    time=game.begin_time,
                    mu=trueskill.MU,
                    sigma=trueskill.SIGMA,
                )
                self.session.add(rating)
            trueskill_rating = trueskill.Rating(rating.mu, rating.sigma)
            trueskill_ratings.append(trueskill_rating)

        new_ratings = [
            orm.Rating(
                user=game_player.user, rating_type=rating_type, time=game.end_time
            )
            for game_player in game_players
        ]
        self.session.add_all(new_ratings)

        trueskill_environment = self.get_trueskill_environment(rating_type)

        if game_mode_name == "Teams":
            rating_groups = [
                [trueskill_ratings[0], trueskill_ratings[2]],
                [trueskill_ratings[1], trueskill_ratings[3]],
            ]
            ranks = [
                -(game_players[0].score + game_players[2].score),
                -(game_players[1].score + game_players[3].score),
            ]
            rating_groups_result = trueskill_environment.rate(rating_groups, ranks)
            new_ratings[0].mu = rating_groups_result[0][0].mu
            new_ratings[0].sigma = rating_groups_result[0][0].sigma
            new_ratings[1].mu = rating_groups_result[1][0].mu
            new_ratings[1].sigma = rating_groups_result[1][0].sigma
            new_ratings[2].mu = rating_groups_result[0][1].mu
            new_ratings[2].sigma = rating_groups_result[0][1].sigma
            new_ratings[3].mu = rating_groups_result[1][1].mu
            new_ratings[3].sigma = rating_groups_result[1][1].sigma
        else:
            rating_groups = [
                [trueskill_rating] for trueskill_rating in trueskill_ratings
            ]
            ranks = [[-game_player.score] for game_player in game_players]
            rating_groups_result = trueskill_environment.rate(rating_groups, ranks)
            for player_index, rating_group_result in enumerate(rating_groups_result):
                new_ratings[player_index].mu = rating_group_result[0].mu
                new_ratings[player_index].sigma = rating_group_result[0].sigma

        for rating in new_ratings:
            self.lookup.add_rating(rating)

    def get_trueskill_environment(self, rating_type):
        trueskill_environment = self.trueskill_environment_lookup.get(rating_type.name)
        if trueskill_environment:
            return trueskill_environment

        trueskill_environment = trueskill.TrueSkill(
            beta=trueskill.SIGMA,
            draw_probability=Logs2DB.rating_type_to_draw_probability[rating_type.name],
        )

        self.trueskill_environment_lookup[rating_type.name] = trueskill_environment
        return trueskill_environment


class StatsGen:
    users_sql = sqlalchemy.sql.text(
        """
        select distinct user.user_id,
            user.name
        from user
        """
    )
    ratings_sql = sqlalchemy.sql.text(
        """
        select user.name,
            rating_type.name as rating_type,
            rating.time,
            rating.mu,
            rating.sigma,
            rating_summary.num_games
        from rating
        join (
            select max(rating_id) as rating_id,
                count(rating_id) - 1 as num_games
            from rating
            group by user_id, rating_type_id
        ) rating_summary on rating.rating_id = rating_summary.rating_id
        join rating_type on rating.rating_type_id = rating_type.rating_type_id
        join user on rating.user_id = user.user_id
        where rating.time >= unix_timestamp() - 30 * 24 * 60 * 60
        order by rating.mu - rating.sigma * 3 desc, rating.mu desc, rating.time asc, rating.user_id asc
        """
    )
    user_ratings_sql = sqlalchemy.sql.text(
        """
        select rating_type.name,
            rating.time,
            rating.mu,
            rating.sigma
        from rating
        join (
            select max(rating_id) as rating_id
            from rating
            where rating.user_id = :user_id
            group by rating_type_id
        ) rating_summary on rating.rating_id = rating_summary.rating_id
        join rating_type on rating.rating_type_id = rating_type.rating_type_id
        order by rating_type.name
        """
    )
    user_games_sql = sqlalchemy.sql.text(
        """
        select distinct game.game_id,
            game.end_time,
            game.game_mode_id,
            game_player.player_index,
            user.name,
            game_player.score
        from game
        join (
            select game.game_id
            from game
            join game_player on game.game_id = game_player.game_id
            where game_player.user_id = :user_id
                and game_player.score is not null
        ) game_ids on game.game_id = game_ids.game_id
        join game_player on game.game_id = game_player.game_id
        join user on game_player.user_id = user.user_id
        order by game.end_time desc, game.game_id desc, game_player.player_index asc
        """
    )

    def __init__(self, session, output_dir):
        self.session = session
        self.output_dir = output_dir

    def get_user_id_to_name(self):
        user_id_to_name = {}
        for row in self.session.execute(StatsGen.users_sql):
            user_id_to_name[row.user_id] = row.name.decode()
        return user_id_to_name

    def output_ratings(self):
        rating_type_to_ratings = collections.defaultdict(list)
        for row in self.session.execute(StatsGen.ratings_sql):
            rating_type_to_ratings[row.rating_type.decode()].append(
                [row.name, row.time, row.mu, row.sigma, row.num_games]
            )

        self.write_file("ratings", rating_type_to_ratings)

    def output_user(self, user_id, username):
        ratings = {}
        for row in self.session.execute(
            StatsGen.user_ratings_sql, {"user_id": user_id}
        ):
            ratings[row.name.decode()] = [row.time, row.mu, row.sigma]

        games = []
        last_game_id = None
        for row in self.session.execute(StatsGen.user_games_sql, {"user_id": user_id}):
            if row.game_id != last_game_id:
                games.append([row.game_mode_id, row.end_time, []])
            games[-1][2].append([row.name.decode(), row.score])
            last_game_id = row.game_id

        records = get_records(username, games)

        for record_key in records:
            if record_key in ratings:
                ratings[record_key].append(records[record_key])

        self.write_file(
            "users/"
            + base64.b64encode(username.encode())
            .decode()
            .replace("=", "")
            .replace("+", "-")
            .replace("/", "_"),
            {"ratings": ratings, "games": games[:100]},
        )

    def write_file(self, filename_prefix, contents):
        with open(os.path.join(self.output_dir, filename_prefix + ".json"), "w") as f:
            f.write(ujson.dumps(contents))


def get_records(username, games):
    records = {
        "Singles2": [0, 0],
        "Singles3": [0, 0, 0],
        "Singles4": [0, 0, 0, 0],
        "Teams": [0, 0],
    }

    for game in games:
        is_singles_game = game[0] == 1
        result = [[x[0] == username, x[1]] for x in game[2]]

        record_key = "Singles" + str(len(result)) if is_singles_game else "Teams"

        if record_key not in records:
            continue

        if not is_singles_game:
            result = [
                [
                    result[0][0] or result[2][0],
                    result[0][1] + result[2][1],
                ],
                [
                    result[1][0] or result[3][0],
                    result[1][1] + result[3][1],
                ],
            ]

        result.sort(key=lambda r: (-r[1], -1 if r[0] else 0))

        place = [i for i, r in enumerate(result) if r[0]][0]

        records[record_key][place] += 1

    return records


def process_logs(write_stats_files):
    with orm.session_scope() as session:
        lookup = orm.Lookup(session)
        logs2db = Logs2DB(session, lookup)

        kv_last_log_timestamp = lookup.get_key_value("cron last log timestamp")
        last_log_timestamp = (
            1408905413
            if kv_last_log_timestamp.value is None
            else int(kv_last_log_timestamp.value)
        )
        kv_last_offset = lookup.get_key_value("cron last offset")
        last_offset = 0 if kv_last_offset.value is None else int(kv_last_offset.value)

        completed_game_users = set()
        for log_timestamp, filename in util.get_log_file_filenames(
            "py", begin=last_log_timestamp
        ):
            if log_timestamp != last_log_timestamp:
                last_offset = 0

            with util.open_possibly_gzipped_file(filename) as f:
                if last_offset:
                    f.seek(last_offset)
                last_offset, new_completed_game_users = logs2db.process_logs(
                    f, log_timestamp
                )
                completed_game_users.update(new_completed_game_users)

            last_log_timestamp = log_timestamp

        kv_last_log_timestamp.value = last_log_timestamp
        kv_last_offset.value = last_offset

        session.flush()

        if write_stats_files and completed_game_users:
            statsgen = StatsGen(session, "stats_temp")
            statsgen.output_ratings()
            for user in completed_game_users:
                statsgen.output_user(user.user_id, user.name)

            ratings_filenames = glob.glob("stats_temp/*.json")
            users_filenames = glob.glob("stats_temp/users/*.json")
            if ratings_filenames:
                command = ["zopfli"]
                command.extend(ratings_filenames)
                command.extend(users_filenames)
                subprocess.call(command)

                ratings_filenames = ratings_filenames + [
                    x + ".gz" for x in ratings_filenames
                ]
                users_filenames = users_filenames + [x + ".gz" for x in users_filenames]

                command = ["touch", "-r", "stats_temp/ratings.json"]
                command.extend(ratings_filenames)
                command.extend(users_filenames)
                subprocess.call(command)

                command = ["mv"]
                command.extend(ratings_filenames)
                command.append("web/stats/data")
                subprocess.call(command)

                command = ["mv"]
                command.extend(users_filenames)
                command.append("web/stats/data/users")
                subprocess.call(command)


def output_all_stats_files():
    with orm.session_scope() as session:
        statsgen = StatsGen(session, "/tmp/tim/acquire/stats")
        statsgen.output_ratings()
        user_id_to_name = statsgen.get_user_id_to_name()
        for user_id in sorted(user_id_to_name):
            username = user_id_to_name[user_id]
            print(user_id, username)
            statsgen.output_user(user_id, username)


def main():
    while True:
        try:
            process_logs(True)
        except:
            print(traceback.format_exc())

        time.sleep(60)


if __name__ == "__main__":
    # process_logs(False)
    # output_all_stats_files()
    main()
