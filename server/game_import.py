#!/usr/bin/env python3

import collections
import cron
import datetime
import glob
import html.parser
import orm
import pickle
import pytz
import re
import sqlalchemy.sql
import sys
import ujson

game_type_to_num_players = {'teams': 4, '1singles': 1, '2singles': 2, '3singles': 3, '4singles': 4}
game_type_to_mode = {'teams': 'Teams', '1singles': 'Singles', '2singles': 'Singles', '3singles': 'Singles', '4singles': 'Singles'}
starting_date = int(datetime.datetime(2014, 1, 1).timestamp())


class MyHTMLParser(html.parser.HTMLParser):
    datetime_regex = re.compile(r'(\d+)-0?(\d+)-0?(\d+) 0?(\d+):0?(\d+):0?(\d+)')

    def __init__(self, game_type_to_date_to_result):
        super().__init__()

        self.game_type_to_date_to_result = game_type_to_date_to_result

        self._started = False
        self._tr_count = 0
        self._result = []
        self._in_td = False
        self._td_data = []

    def handle_starttag(self, tag, attrs):
        if self._started:
            if tag == 'tr':
                self._tr_count += 1
                self._result = []
            if tag == 'td':
                self._in_td = True
                self._td_data = []

    def handle_endtag(self, tag):
        if self._started:
            if tag == 'tr' and self._tr_count > 1:
                try:
                    if len(self._result) == 8:
                        player, game_type, _, score, team_total, _, _, game_date = self._result
                        player = ' '.join(player.split())
                        game_date = int(datetime.datetime(*map(int, MyHTMLParser.datetime_regex.match(game_date).groups()), tzinfo=pytz.utc).timestamp())

                        if game_date >= starting_date and game_type in game_type_to_num_players:
                            date_to_result = self.game_type_to_date_to_result[game_type]
                            if game_date not in date_to_result:
                                date_to_result[game_date] = {}

                            if game_type == 'teams':
                                result = (int(team_total) // 100, int(score) // 100)
                            else:
                                result = int(score) // 100

                            date_to_result[game_date][player] = result
                except:
                    pass
            if tag == 'td':
                self._in_td = False
                self._result.append(' '.join(self._td_data))

    def handle_data(self, data):
        if not self._started:
            if data.strip() == 'Games Played by Most Recent':
                self._started = True

        if self._in_td:
            self._td_data.append(data.strip())


def part1():
    game_type_to_date_to_result = {game_type: {} for game_type in game_type_to_mode.keys()}
    for filename in glob.iglob('../../../netacquire.ca/players/*.html'):
        with open(filename, 'r', encoding='latin_1') as f:
            contents = f.read()
        parser = MyHTMLParser(game_type_to_date_to_result)
        parser.feed(contents)

    with open('game_import_data.bin', 'wb') as f:
        pickle.dump(game_type_to_date_to_result, f)


game_type_to_date_to_tweaked_dates_and_results = {
    'teams': {
        1388700206: [
            [1388700206, {
                'Wasabis': (672, 452),
                '32': (672, 220),
                'Bur Jr': (573, 393),
                'Ackwyerkk': (573, 180)
            }],
            [1388700207, {
                'Alias': (669, 207),
                'CJ TEAMS': (669, 462),
                'disenchanted 66.234': (570, 254),
                'Road Runner': (570, 316)
            }],
        ],
        1392757040: [
            [1392757040, {
                'RT-TEAM-GAMES-PARTNERS': (786, 360),
                'Koda': (786, 426),
                'solrei': (665, 425),
                'Alias': (665, 240)
            }],
            [1392757041, {
                'THE HABS': (644, 311),
                'BooYahh': (644, 333),
                'Neomdivad': (628, 281),
                'YATEAM': (628, 347)
            }],
        ],
        1395966664: [
            [1395966664, {
                'larry1959': (860, 445),
                'Players': (860, 415),
                'Sneaky': (733, 440),
                'Tax Man': (733, 293)
            }],
        ],
        1395966666: [
            [1395966666, {
                'UdaFool': (677, 383),
                'solrei': (677, 294),
                'Alias': (577, 307),
                'RT-TEAM-GAMES-PARTNERS': (577, 270)
            }],
        ],
        1395966667: [],
        1405040656: [
            [1405040656, {
                'knicks1': (774, 353),
                'Marvelous': (774, 421),
                'Wasabis': (625, 240),
                'disenchanted 66.234': (625, 385),
            }],
            [1405040657, {
                'solrei': (751, 425),
                'dj174.52': (751, 326),
                'Honokai': (672, 458),
                'Players': (672, 214)
            }],
        ],
        1412536558: [
            [1412536558, {
                'dj174.52': (807, 549),
                'marshal': (807, 258),
                'foxx': (753, 350),
                'solrei': (753, 403)
            }],
        ],
        1412536559: [
            [1412536559, {
                'KABOOK-TEAMGAME': (696, 369),
                'Rooster Cogburn': (696, 327),
                'Alias': (596, 322),
                'mansoor': (596, 274)
            }],
        ],
    }
}


def get_game_data():
    with open('game_import_data.bin', 'rb') as f:
        game_type_to_date_to_result = pickle.load(f)

    for game_type, date_to_result in game_type_to_date_to_result.items():
        bad_date_to_count = {}
        date_to_new_date = {}
        num_players_needed = game_type_to_num_players[game_type]

        for date, result in sorted(date_to_result.items()):
            num_players = len(result)
            if num_players < num_players_needed:
                added_tweak = False
                for new_date in range(date - 1, date - 31, -1):
                    if new_date in bad_date_to_count and bad_date_to_count[new_date] + num_players <= num_players_needed:
                        bad_date_to_count[new_date] += num_players
                        date_to_new_date[date] = new_date
                        added_tweak = True
                if not added_tweak:
                    bad_date_to_count[date] = num_players

        for date, new_date in sorted(date_to_new_date.items(), reverse=True):
            try:
                date_to_result[new_date].update(date_to_result[date])
                del date_to_result[date]
            except:
                print('huh?', date, new_date)

    results = []
    game_type_to_total_count = {game_type: 0 for game_type in game_type_to_mode.keys()}
    game_type_to_draw_count = {game_type: 0 for game_type in game_type_to_mode.keys()}
    for game_type, date_to_result in game_type_to_date_to_result.items():
        date_to_tweaked_dates_and_results = game_type_to_date_to_tweaked_dates_and_results.get(game_type, {})

        num_players_needed = game_type_to_num_players[game_type]

        if game_type == 'teams':
            key = lambda x: (-x[1][0], -x[1][1], x[0].lower())
        else:
            key = lambda x: (-x[1], x[0].lower())

        for date_, result_ in sorted(date_to_result.items()):
            dates_and_results = [(date_, result_)]

            if date_ in date_to_tweaked_dates_and_results:
                dates_and_results = date_to_tweaked_dates_and_results[date_]

            for date, result in dates_and_results:
                num_players = len(result)
                scores = sorted(result.items(), key=key)

                if num_players == num_players_needed:
                    has_draw = False
                    if game_type == 'teams':
                        if scores[1][1][0] == scores[2][1][0]:
                            has_draw = True
                            scores = sorted(result.items(), key=lambda x: (-x[1][1], x[0].lower()))
                            scores = [scores[0], scores[1], scores[3], scores[2]]
                            if scores[0] == scores[1]:
                                print('huh?')
                        else:
                            scores = [scores[0], scores[2], scores[1], scores[3]]
                        scores = [(x[0], x[1][1]) for x in scores]
                    else:
                        for i in range(len(scores) - 1):
                            if scores[i][1] == scores[i + 1][1]:
                                has_draw = True

                    game_type_to_total_count[game_type] += 1
                    if has_draw:
                        game_type_to_draw_count[game_type] += 1

                results.append([date, game_type, scores])

    results.sort()

    return {'results': results, 'game_type_to_total_count': game_type_to_total_count, 'game_type_to_draw_count': game_type_to_draw_count}


def print_game_import_row(end, mode, scores):
    print('{"_":"game-import","end":' + str(end) + ',"mode":"' + mode + '","scores":' + ujson.dumps(scores) + '}')


def part2():
    game_data = get_game_data()

    for date, game_type, scores in game_data['results']:
        num_players = len(scores)
        num_players_needed = game_type_to_num_players[game_type]
        if num_players == num_players_needed:
            comp = 'eq'
        elif num_players < num_players_needed:
            comp = 'lt'
        else:
            comp = 'gt'
        print(comp, date, datetime.datetime.fromtimestamp(date, tz=pytz.utc), game_type, scores)

        if num_players == num_players_needed:
            print_game_import_row(date, game_type_to_mode[game_type], scores)
        else:
            print('#', {key: value for key, value in scores})

    for game_type in sorted(game_type_to_mode.keys()):
        draw_count = game_data['game_type_to_draw_count'][game_type]
        total_count = game_data['game_type_to_total_count'][game_type]
        print(game_type, draw_count, total_count, 100 * draw_count / total_count)


def compare1():
    with orm.session_scope() as session:
        query = sqlalchemy.sql.text('''
            select game.game_id,
                game.end_time,
                game_mode.name as game_mode,
                user.name as username,
                game_player.score
            from game
            join game_mode on game.game_mode_id = game_mode.game_mode_id
            join game_player on game.game_id = game_player.game_id
            join user on game_player.user_id = user.user_id
            where game.imported = 1
            order by game.game_id, game_player.player_index
        ''')
        game_id_to_data = collections.defaultdict(lambda: {'scores': []})
        for row in session.execute(query):
            data = game_id_to_data[row.game_id]
            data['end_time'] = row.end_time
            data['game_mode'] = row.game_mode.decode()
            data['scores'].append((row.username.decode(), row.score))

        for game_id in sorted(game_id_to_data.keys()):
            data = game_id_to_data[game_id]
            print_game_import_row(data['end_time'], data['game_mode'], data['scores'])


def compare2():
    game_data = get_game_data()

    for date, game_type, scores in game_data['results']:
        num_players = len(scores)
        num_players_needed = game_type_to_num_players[game_type]
        if num_players == num_players_needed:
            print_game_import_row(date, game_type_to_mode[game_type], scores)


def import_into_database():
    class Cron1Logs2DB(cron.Logs2DB):
        def calculate_new_ratings(self, game, game_players):
            return

    with orm.session_scope() as session:
        lookup = orm.Lookup(session)
        logs2db = Cron1Logs2DB(session, lookup)

        with open('game_import_data.txt', 'r') as f:
            logs2db.process_logs(f, 'x')


def calculate_ratings():
    with orm.session_scope() as session:
        lookup = orm.Lookup(session)
        logs2db = cron.Logs2DB(session, lookup)

        query = sqlalchemy.sql.text('''
            select game.log_time,
                game.number,
                count(distinct game_player.game_player_id) as num_players
            from game
            join game_state on game.game_state_id = game_state.game_state_id
            join game_player on game.game_id = game_player.game_id
            where game_state.name = 'Completed'
            group by game.game_id
            having num_players between 2 and 4
            order by game.end_time asc
        ''')
        for row in session.execute(query):
            game = lookup.get_game(row.log_time, row.number)
            game_players = []
            for player_index in range(row.num_players):
                game_players.append(lookup.get_game_player(game, player_index))
            logs2db.calculate_new_ratings(game, game_players)


def generate_stats_json_files():
    with orm.session_scope() as session:
        statsgen = cron.StatsGen(session, '/opt/data/tim/stats')
        user_id_to_name = statsgen.get_user_id_to_name()
        statsgen.output_users(user_id_to_name)
        for user_id in user_id_to_name.keys():
            statsgen.output_user(user_id)


def main():
    if sys.argv[1] == 'part1':
        part1()
    elif sys.argv[1] == 'part2':
        part2()
    elif sys.argv[1] == 'compare1':
        compare1()
    elif sys.argv[1] == 'compare2':
        compare2()
    elif sys.argv[1] == 'import_into_database':
        import_into_database()
    elif sys.argv[1] == 'calculate_ratings':
        calculate_ratings()
    elif sys.argv[1] == 'generate_stats_json_files':
        generate_stats_json_files()
    else:
        print('bad mode')


if __name__ == '__main__':
    main()
