#!/usr/bin/env python3.4m

import collections
import orm
import sqlalchemy.orm
import ujson


class Logs2DB:
    def __init__(self, session):
        self.session = session
        self.game_lookup = collections.defaultdict(dict)
        self.game_mode_lookup = {}
        self.game_player_lookup = collections.defaultdict(lambda: collections.defaultdict(dict))
        self.game_state_lookup = {}
        self.user_lookup = {}

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
        game.begin_time = params['end']
        game.end_time = params['end']
        game.game_state = self.get_game_state('Completed')
        game.game_mode = self.get_game_mode(params['mode'])
        game.imported = 1

        for player_index, name_and_score in enumerate(params['scores']):
            name, score = name_and_score
            game_player = orm.GamePlayer()
            self.session.add(game_player)
            game_player.game = game
            game_player.player_index = player_index
            game_player.user = self.get_user(name)
            game_player.score = score

    def process_game_player(self, params):
        game_player = self.get_game_player(params['_log-time'], params['game-id'], params['player-id'])

        game_player.user = self.get_user(params['username'])

    def process_game_result(self, params):
        for player_index, score in enumerate(params['scores']):
            game_player = self.get_game_player(params['_log-time'], params['game-id'], player_index)

            game_player.score = score

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
