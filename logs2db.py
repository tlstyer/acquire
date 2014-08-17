#!/usr/bin/env python3.4m

import orm
import sqlalchemy.orm
import ujson


class Logs2DB:
    def __init__(self, session):
        self.session = session
        self.user_lookup = {}
        self.game_mode_lookup = {}
        self.game_state_lookup = {}

        self.method_lookup = {
            'game-import': self.process_game_import,
        }

    def process_file(self, pathname):
        with open(pathname, 'r') as f:
            for line in f:
                if line and line[0] == '{':
                    params = ujson.decode(line)
                    self.method_lookup[params['_']](params)

    def process_game_import(self, params):
        game = orm.Game()
        game.log_time = params['end']
        game.number = len(params['scores']) - 1 if params['mode'] == 'Singles' else 4
        game.begin_time = params['end']
        game.end_time = params['end']
        game.game_state = self.get_game_state('Completed')
        game.game_mode = self.get_game_mode(params['mode'])
        game.imported = 1
        self.session.add(game)

        for player_index, name_and_score in enumerate(params['scores']):
            name, score = name_and_score
            game_player = orm.GamePlayer()
            game_player.game = game
            game_player.player_index = player_index
            game_player.user = self.get_user(name)
            game_player.score = score
            self.session.add(game_player)

    def get_game_mode(self, name):
        game_mode = self.game_mode_lookup.get(name, None)
        if game_mode:
            return game_mode

        game_mode = self.session.query(orm.GameMode).filter_by(name=name).scalar()

        self.game_mode_lookup[name] = game_mode
        return game_mode

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
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)()
    logs2db = Logs2DB(session)
    logs2db.process_file('game_import_data.txt')
    session.commit()


if __name__ == '__main__':
    main()
