#!/usr/bin/env python3.4m

import collections
import orm
import sqlalchemy.orm
import sys
import trueskill
import ujson


class Logs2DB:
    rating_type_to_draw_probability = {
        'Singles2': .0042,
        'Singles3': .0022,
        'Singles4': .0161,
        'Teams': .0023,
    }

    def __init__(self, session):
        self.session = session
        self.game_lookup = collections.defaultdict(dict)
        self.game_mode_lookup = {}
        self.game_player_lookup = collections.defaultdict(lambda: collections.defaultdict(dict))
        self.game_state_lookup = {}
        self.rating_lookup = collections.defaultdict(dict)
        self.rating_type_lookup = {}
        self.user_lookup = {}
        self.trueskill_environment_lookup = {}

        self.method_lookup = {
            'game': self.process_game,
            'game-import': self.process_game_import,
            'game-player': self.process_game_player,
            'game-result': self.process_game_result,
        }

    def process_logs(self, file, log_time=None):
        for line in file:
            if line and line[0] == '{' and line[-1] == '\n':
                params = ujson.decode(line)
                params['_log-time'] = log_time
                self.method_lookup[params['_']](params)

    def process_game(self, params):
        game = self.get_game(params['_log-time'], params['game-id'])

        begin_time = params.get('begin', None)
        if begin_time:
            game.begin_time = begin_time

        end_time = params.get('end', None)
        if end_time:
            game.end_time = end_time

        game.game_state = self.get_game_state(params['state'])

        game_mode = params.get('mode', None)
        if game_mode:
            game.game_mode = self.get_game_mode(game_mode)

        game.imported = 0

    def process_game_import(self, params):
        game = orm.Game()
        self.session.add(game)
        game.log_time = params['end'] - 1000000000
        game.number = len(params['scores']) - 1 if params['mode'] == 'Singles' else 4
        game.begin_time = params['end'] - 300
        game.end_time = params['end']
        game.game_state = self.get_game_state('Completed')
        game.game_mode = self.get_game_mode(params['mode'])
        game.imported = 1

        game_players = []
        for player_index, name_and_score in enumerate(params['scores']):
            name, score = name_and_score
            game_player = orm.GamePlayer()
            self.session.add(game_player)
            game_player.game = game
            game_player.player_index = player_index
            game_player.user = self.get_user(name)
            game_player.score = score
            game_players.append(game_player)

        self.calculate_new_ratings(game, game_players)

    def process_game_player(self, params):
        game_player = self.get_game_player(params['_log-time'], params['game-id'], params['player-id'])
        game_player.user = self.get_user(params['username'])

    def process_game_result(self, params):
        game = self.get_game(params['_log-time'], params['game-id'])

        game_players = []
        for player_index, score in enumerate(params['scores']):
            game_player = self.get_game_player(params['_log-time'], params['game-id'], player_index)
            game_player.score = score
            game_players.append(game_player)

        self.calculate_new_ratings(game, game_players)

    def get_game(self, log_time, number):
        game = self.game_lookup[log_time].get(number, None)
        if game:
            return game

        game = self.session.query(orm.Game).filter_by(log_time=log_time, number=number).scalar()
        if not game:
            game = orm.Game(log_time=log_time, number=number)
            self.session.add(game)

        self.game_lookup[log_time][number] = game
        return game

    def get_game_mode(self, name):
        game_mode = self.game_mode_lookup.get(name, None)
        if game_mode:
            return game_mode

        game_mode = self.session.query(orm.GameMode).filter_by(name=name).scalar()

        self.game_mode_lookup[name] = game_mode
        return game_mode

    def get_game_player(self, log_time, number, player_index):
        game_player = self.game_player_lookup[log_time][number].get(player_index, None)
        if game_player:
            return game_player

        game = self.get_game(log_time, number)
        if game.game_id:
            game_player = self.session.query(orm.GamePlayer).filter_by(game_id=game.game_id, player_index=player_index).scalar()

        if not game_player:
            game_player = orm.GamePlayer(game=game, player_index=player_index)
            self.session.add(game_player)

        self.game_player_lookup[log_time][number][player_index] = game_player
        return game_player

    def get_game_state(self, name):
        game_state = self.game_state_lookup.get(name, None)
        if game_state:
            return game_state

        game_state = self.session.query(orm.GameState).filter_by(name=name).scalar()

        self.game_state_lookup[name] = game_state
        return game_state

    def get_rating(self, user, rating_type):
        rating = self.rating_lookup[user.name].get(rating_type.name, None)
        if rating:
            return rating

        if user.user_id:
            rating = self.session.query(orm.Rating).filter_by(user=user, rating_type=rating_type).order_by(orm.Rating.rating_id.desc()).limit(1).scalar()

        if not rating:
            rating = orm.Rating(user=user, rating_type=rating_type, mu=trueskill.MU, sigma=trueskill.SIGMA)
            self.session.add(rating)

        self.rating_lookup[user.name][rating_type.name] = rating
        return rating

    def get_rating_type(self, name):
        rating_type = self.rating_type_lookup.get(name, None)
        if rating_type:
            return rating_type

        rating_type = self.session.query(orm.RatingType).filter_by(name=name).scalar()

        self.rating_type_lookup[name] = rating_type
        return rating_type

    def get_user(self, name):
        user = self.user_lookup.get(name, None)
        if user:
            return user

        user = self.session.query(orm.User).filter_by(name=name).scalar()
        if not user:
            user = orm.User(name=name)
            self.session.add(user)

        self.user_lookup[name] = user
        return user

    def calculate_new_ratings(self, game, game_players):
        game_mode_name = game.game_mode.name.decode()
        num_players = len(game_players)
        if game_mode_name == 'Teams':
            rating_type = self.get_rating_type('Teams')
        elif game_mode_name == 'Singles' and 2 <= num_players <= 4:
            rating_type = self.get_rating_type('Singles' + str(num_players))
        else:
            return

        trueskill_ratings = []
        for game_player in game_players:
            rating = self.get_rating(game_player.user, rating_type)
            if rating.time is None:
                # update initial rating
                rating.time = game.begin_time
            trueskill_rating = trueskill.Rating(rating.mu, rating.sigma)
            trueskill_ratings.append(trueskill_rating)

        new_ratings = [orm.Rating(user=game_player.user, rating_type=rating_type, time=game.end_time) for game_player in game_players]
        self.session.add_all(new_ratings)

        trueskill_environment = self.get_trueskill_environment(rating_type)

        if game_mode_name == 'Teams':
            rating_groups = [[trueskill_ratings[0], trueskill_ratings[2]], [trueskill_ratings[1], trueskill_ratings[3]]]
            ranks = [-(game_players[0].score + game_players[2].score), -(game_players[1].score + game_players[3].score)]
            rating_groups_result = trueskill_environment.rate(rating_groups, ranks)
            new_ratings[0].sigma = rating_groups_result[0][0].sigma
            new_ratings[0].mu = rating_groups_result[0][0].mu
            new_ratings[1].sigma = rating_groups_result[1][0].sigma
            new_ratings[1].mu = rating_groups_result[1][0].mu
            new_ratings[2].sigma = rating_groups_result[0][1].sigma
            new_ratings[2].mu = rating_groups_result[0][1].mu
            new_ratings[3].sigma = rating_groups_result[1][1].sigma
            new_ratings[3].mu = rating_groups_result[1][1].mu
        else:
            rating_groups = [[trueskill_rating] for trueskill_rating in trueskill_ratings]
            ranks = [[-game_player.score] for game_player in game_players]
            rating_groups_result = trueskill_environment.rate(rating_groups, ranks)
            for player_index, rating_group_result in enumerate(rating_groups_result):
                new_ratings[player_index].sigma = rating_group_result[0].sigma
                new_ratings[player_index].mu = rating_group_result[0].mu

        for rating in new_ratings:
            self.rating_lookup[rating.user.name][rating_type.name] = rating

    def get_trueskill_environment(self, rating_type):
        trueskill_environment = self.trueskill_environment_lookup.get(rating_type.name)
        if trueskill_environment:
            return trueskill_environment

        trueskill_environment = trueskill.TrueSkill(beta=trueskill.SIGMA, draw_probability=Logs2DB.rating_type_to_draw_probability[rating_type.name.decode()])

        self.trueskill_environment_lookup[rating_type.name] = trueskill_environment
        return trueskill_environment


def main():
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)(autoflush=False)
    logs2db = Logs2DB(session)
    with open('game_import_data.txt', 'r') as f:
        logs2db.process_logs(f)
    with open('/home/tim/server_mirror/home-tim-acquire/logs_py/1407991178', 'r') as f:
        logs2db.process_logs(f, 1407991178)
    session.commit()


if __name__ == '__main__':
    main()
