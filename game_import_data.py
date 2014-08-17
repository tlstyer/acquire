#!/usr/bin/env python3.4m

import datetime
import glob
import html.parser
import pickle
import re
import sys
import ujson

game_type_to_num_players = {'teams': 4, '2singles': 2, '3singles': 3, '4singles': 4}
game_type_to_mode = {'teams': 'Teams', '2singles': 'Singles', '3singles': 'Singles', '4singles': 'Singles'}
starting_date = int(datetime.datetime(2014, 1, 1).timestamp())


class MyHTMLParser(html.parser.HTMLParser):
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
                        player, game_type, win, score, team_total, team_differential, average_turn, game_date = self._result
                        player = ' '.join(player.split())
                        game_date = int(datetime.datetime.strptime(game_date, '%Y-%m-%d %H:%M:%S').timestamp())

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
    re_gamebot = re.compile(r'.*/GAMEBOT-\d+\.html$')
    game_type_to_date_to_result = {game_type: {} for game_type in game_type_to_mode.keys()}
    for filename in glob.iglob('../../netacquire.ca/players/*.html'):
        if not re_gamebot.match(filename):
            with open(filename, 'r', encoding='latin_1') as f:
                contents = f.read()
            parser = MyHTMLParser(game_type_to_date_to_result)
            parser.feed(contents)

    with open('game_import_data.bin', 'wb') as f:
        pickle.dump(game_type_to_date_to_result, f)


def part2():
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
        num_players_needed = game_type_to_num_players[game_type]

        if game_type == 'teams':
            key = lambda x: (-x[1][0], -x[1][1], x[0].lower())
        else:
            key = lambda x: (-x[1], x[0].lower())

        for date, result in sorted(date_to_result.items()):
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

    for date, game_type, scores in results:
        num_players = len(scores)
        num_players_needed = game_type_to_num_players[game_type]
        if num_players == num_players_needed:
            comp = 'eq'
        elif num_players < num_players_needed:
            comp = 'lt'
        else:
            comp = 'gt'
        print(comp, date, datetime.datetime.fromtimestamp(date), game_type, scores)

        if num_players == num_players_needed:
            print(ujson.dumps({'_': 'game-import', 'end': date, 'mode': game_type_to_mode[game_type], 'scores': scores}))

    for game_type in sorted(game_type_to_mode.keys()):
        draw_count = game_type_to_draw_count[game_type]
        total_count = game_type_to_total_count[game_type]
        print(game_type, draw_count, total_count, 100 * draw_count / total_count)


if __name__ == '__main__':
    if sys.argv[1] == 'part1':
        part1()
    elif sys.argv[1] == 'part2':
        part2()
    else:
        print('bad mode')
