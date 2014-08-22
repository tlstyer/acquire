#!/usr/bin/env python3.4m

import collections
import orm
import ormlookup
import sqlalchemy.orm
import sqlalchemy.sql
import sqlalchemy.types
import ujson


class StatsGen:
    output_dir = 'stats/'

    users_to_update_sql = sqlalchemy.sql.text('''
        select game.game_id,
            game.end_time,
            user.user_id
        from game
        join game_player on game.game_id = game_player.game_id
        join user on game_player.user_id = user.user_id
        where game.end_time >= :end_time
            and game_player.score is not null
        order by game.end_time asc
    ''')
    users_sql = sqlalchemy.sql.text('''
        select user.user_id,
            user.name
        from user
    ''')
    user_ratings_sql = sqlalchemy.sql.text('''
        select rating_type.name,
            rating.time,
            rating.mu,
            rating.sigma
        from rating
        join rating_type on rating.rating_type_id = rating_type.rating_type_id
        where rating.user_id = :user_id
        order by rating.time asc, rating.rating_id asc
    ''')
    user_games_sql = sqlalchemy.sql.text('''
        select game.game_id,
            game.end_time,
            game.game_mode_id,
            game_player.user_id,
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
        order by game.end_time desc, game.game_id desc, game_player.player_index asc
    ''')

    def __init__(self, session):
        self.session = session
        self.lookup = ormlookup.Lookup(session)

    def do_work(self):
        kv_last_end_time = self.lookup.get_key_value('statsgen last end_time')
        last_end_time = 0 if kv_last_end_time.value is None else int(kv_last_end_time.value)
        kv_last_game_ids = self.lookup.get_key_value('statsgen last game_ids')
        last_game_ids = set() if kv_last_game_ids.value is None else {int(x) for x in kv_last_game_ids.value.split(',')}
        kv_last_user_id = self.lookup.get_key_value('statsgen last user_id')
        last_user_id = 0 if kv_last_user_id.value is None else int(kv_last_user_id.value)

        update_users = False
        update_user_ids = set()
        next_last_game_ids = last_game_ids.copy()
        for row in self.session.execute(StatsGen.users_to_update_sql, {'end_time': last_end_time}):
            if row.game_id not in last_game_ids:
                if row.end_time > last_end_time:
                    last_end_time = row.end_time
                    next_last_game_ids = set()
                next_last_game_ids.add(row.game_id)
                if row.user_id > last_user_id:
                    last_user_id = row.user_id
                    update_users = True
                update_user_ids.add(row.user_id)

        if update_users:
            self.output_users()
        for user_id in sorted(update_user_ids):
            self.output_user(user_id)

        kv_last_end_time.value = str(last_end_time)
        kv_last_game_ids.value = ','.join(str(x) for x in next_last_game_ids)
        kv_last_user_id.value = str(last_user_id)

    def output_users(self):
        user_id_to_name = {}
        for row in self.session.execute(StatsGen.users_sql):
            user_id_to_name[row.user_id] = row.name.decode()

        StatsGen.write_file('users', user_id_to_name)

    def output_user(self, user_id):
        ratings = collections.defaultdict(list)
        for row in self.session.execute(StatsGen.user_ratings_sql, {'user_id': user_id}):
            ratings[row.name].append([row.time, row.mu, row.sigma])

        games = []
        last_game_id = None
        for row in self.session.execute(StatsGen.user_games_sql, {'user_id': user_id}):
            if row.game_id != last_game_id:
                games.append([row.game_mode_id, row.end_time, []])
            games[-1][2].append([row.user_id, row.score])
            last_game_id = row.game_id
        games = [game for game in games if len(game[2]) > 1]

        StatsGen.write_file('user' + str(user_id), {'ratings': ratings, 'games': games})

    @staticmethod
    def write_file(filename_prefix, contents):
        with open(StatsGen.output_dir + filename_prefix + '.json', 'w') as f:
            f.write(ujson.dumps(contents))


def main():
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)(autoflush=False, expire_on_commit=False)
    try:
        statsgen = StatsGen(session)
        statsgen.do_work()
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == '__main__':
    main()
