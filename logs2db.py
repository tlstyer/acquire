#!/usr/bin/env python3.4m

import orm
import ormlookup
import sqlalchemy.orm
import trueskill
import ujson


class Logs2DB:
    rating_type_to_draw_probability = {
        'Singles2': .0042,
        'Singles3': .0022,
        'Singles4': .0161,
        'Teams': .0023,
    }

    def __init__(self, session, lookup):
        self.session = session
        self.lookup = lookup
        self.trueskill_environment_lookup = {}

        self.method_lookup = {
            'game': self.process_game,
            'game-import': self.process_game_import,
            'game-player': self.process_game_player,
            'game-result': self.process_game_result,
        }

    def process_logs(self, file, log_time=None):
        len_last_line = 0
        for line in file:
            if line and line[-1] == '\n':
                if line[0] == '{':
                    params = ujson.decode(line)
                    params['_log-time'] = log_time
                    self.method_lookup[params['_']](params)
            else:
                len_last_line = len(line.encode())
        return file.tell() - len_last_line

    def process_game(self, params):
        game = self.lookup.get_game(params['_log-time'], params['game-id'])

        begin_time = params.get('begin', None)
        if begin_time:
            game.begin_time = begin_time

        end_time = params.get('end', None)
        if end_time:
            game.end_time = end_time

        game.game_state = self.lookup.get_game_state(params['state'])

        game_mode = params.get('mode', None)
        if game_mode:
            game.game_mode = self.lookup.get_game_mode(game_mode)

        game.imported = 0

    def process_game_import(self, params):
        game = orm.Game()
        self.session.add(game)
        game.log_time = params['end'] - 1000000000
        game.number = len(params['scores']) - 1 if params['mode'] == 'Singles' else 4
        game.begin_time = params['end'] - 300
        game.end_time = params['end']
        game.game_state = self.lookup.get_game_state('Completed')
        game.game_mode = self.lookup.get_game_mode(params['mode'])
        game.imported = 1

        game_players = []
        for player_index, name_and_score in enumerate(params['scores']):
            name, score = name_and_score
            game_player = orm.GamePlayer()
            self.session.add(game_player)
            game_player.game = game
            game_player.player_index = player_index
            game_player.user = self.lookup.get_user(name)
            game_player.score = score
            game_players.append(game_player)

        self.calculate_new_ratings(game, game_players)

    def process_game_player(self, params):
        game = self.lookup.get_game(params['_log-time'], params['game-id'])
        game_player = self.lookup.get_game_player(game, params['player-id'])
        game_player.user = self.lookup.get_user(params['username'])

    def process_game_result(self, params):
        game = self.lookup.get_game(params['_log-time'], params['game-id'])

        game_players = []
        for player_index, score in enumerate(params['scores']):
            game_player = self.lookup.get_game_player(game, player_index)
            game_player.score = score
            game_players.append(game_player)

        self.calculate_new_ratings(game, game_players)

    def calculate_new_ratings(self, game, game_players):
        game_mode_name = game.game_mode.name
        num_players = len(game_players)
        if game_mode_name == 'Teams':
            rating_type = self.lookup.get_rating_type('Teams')
        elif game_mode_name == 'Singles' and 2 <= num_players <= 4:
            rating_type = self.lookup.get_rating_type('Singles' + str(num_players))
        else:
            return

        trueskill_ratings = []
        for game_player in game_players:
            rating = self.lookup.get_rating(game_player.user, rating_type)
            if not rating:
                rating = orm.Rating(user=game_player.user, rating_type=rating_type, time=game.begin_time, mu=trueskill.MU, sigma=trueskill.SIGMA)
                self.session.add(rating)
            trueskill_rating = trueskill.Rating(rating.mu, rating.sigma)
            trueskill_ratings.append(trueskill_rating)

        new_ratings = [orm.Rating(user=game_player.user, rating_type=rating_type, time=game.end_time) for game_player in game_players]
        self.session.add_all(new_ratings)

        trueskill_environment = self.get_trueskill_environment(rating_type)

        if game_mode_name == 'Teams':
            rating_groups = [[trueskill_ratings[0], trueskill_ratings[2]], [trueskill_ratings[1], trueskill_ratings[3]]]
            ranks = [-(game_players[0].score + game_players[2].score), -(game_players[1].score + game_players[3].score)]
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
            rating_groups = [[trueskill_rating] for trueskill_rating in trueskill_ratings]
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

        trueskill_environment = trueskill.TrueSkill(beta=trueskill.SIGMA, draw_probability=Logs2DB.rating_type_to_draw_probability[rating_type.name])

        self.trueskill_environment_lookup[rating_type.name] = trueskill_environment
        return trueskill_environment


def main():
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)(autoflush=False)
    try:
        lookup = ormlookup.Lookup(session)
        logs2db = Logs2DB(session, lookup)
        with open('game_import_data.txt', 'r') as f:
            logs2db.process_logs(f)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == '__main__':
    main()
