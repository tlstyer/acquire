#!/usr/bin/env python3.4m

import enums
import re
import traceback
import ujson
import util


class AcquireLogProcessor:
    def __init__(self):
        self.server = Server()

        self.commands_to_client_translator = enums.CommandsToClientTranslator({})

        regexes_to_ignore = [
            r'^ ',
            r'^$',
            r'^AttributeError:',
            r'^connection_lost$',
            r'^connection_made$',
            r'^\d+ receive timeout$',
            r'^\d+ send timeout$',
            r'^Exception in callback ',
            r'^handle:',
            r'^ImportError:',
            r'^KeyError:',
            r'^None close$',
            r'^socket\.send\(\) raised exception\.$',
            r'^Traceback \(most recent call last\):',
            r'^UnicodeEncodeError:',
        ]

        self.line_matchers_and_handlers = [
            ('command to client', re.compile(r'^(?P<client_ids>[\d,]+) <- (?P<commands>.*)'), self.handle_command_to_client),
            ('ignore', re.compile('|'.join(regexes_to_ignore)), None),
            ('command to server', re.compile(r'^(?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
            ('log v2', re.compile(r'^(?P<entry>{.*)'), self.handle_log_v2),
            ('disconnect', re.compile(r'^(\d+) disconnect$'), None),
            ('connect v3', re.compile(r'^(?P<client_id>\d+) connect (?P<username>.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$'), self.handle_connect_v2_and_v3),
            ('game expired', re.compile(r'^game #(?P<game_id>\d+) expired(?: \(internal #\d+\))?$'), self.handle_game_expired),
            ('connect v1', re.compile(r'^X connect \d+\.\d+\.\d+\.\d+(?::\d+)? (?P<username>.*)$'), self.handle_connect_v1),
            ('open', re.compile(r'^(?P<client_id>\d+) open \d+\.\d+\.\d+\.\d+(?::\d+)?$'), self.handle_open),
            ('close', re.compile(r'^(\d+) close$'), None),
            ('connect v2', re.compile(r'^(?P<client_id>\d+) connect \d+\.\d+\.\d+\.\d+ (?P<username>.+)$'), self.handle_connect_v2_and_v3),
            ('disconnect after error', re.compile(r'^\d+ -> (\d+) disconnect$'), None),
            ('log v1', re.compile(r'^result (.*)'), None),
            ('command to server after connect printing error', re.compile(r'^\d+ connect (?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
        ]

        self.connect_v1_username = None

    def handle_command_to_client(self, match):
        client_ids = [int(x) for x in match.group('client_ids').split(',')]
        try:
            commands = ujson.decode(match.group('commands'))
        except ValueError:
            return

        try:
            self.commands_to_client_translator.translate(commands)
            return True
        except:
            traceback.print_exc()

    def handle_command_to_server(self, match):
        client_id = int(match.group('client_id'))
        try:
            command = ujson.decode(match.group('command'))
        except ValueError:
            return

        try:
            return True
        except:
            traceback.print_exc()

    def handle_log_v2(self, match):
        try:
            entry = ujson.decode(match.group('entry'))
        except ValueError:
            traceback.print_exc()
            return

        try:
            self.server.handle_log(entry)
            return True
        except:
            traceback.print_exc()

    def handle_game_expired(self, match):
        try:
            self.server.destroy_game(int(match.group('game_id')))
            return True
        except:
            traceback.print_exc()

    def handle_connect_v2_and_v3(self, match):
        self.server.add_client(int(match.group('client_id')), match.group('username'))
        return True

    def handle_connect_v1(self, match):
        self.connect_v1_username = match.group('username')
        return True

    def handle_open(self, match):
        self.server.add_client(int(match.group('client_id')), self.connect_v1_username)
        return True

    def go(self):
        line_type_to_count = {line_type: 0 for line_type, regex, handler in self.line_matchers_and_handlers}
        line_type_to_count['other'] = 0

        for timestamp, path in util.get_log_file_paths('py', begin=1408905413):
            print(path)

            self.server = Server()

            enums_translations = enums.get_translations(timestamp)
            self.commands_to_client_translator = enums.CommandsToClientTranslator(enums_translations)

            try:
                with util.open_possibly_gzipped_file(path) as f:
                    for line in f:
                        if len(line) and line[-1] == '\n':
                            line = line[:-1]

                        handled_line_type = 'other'
                        for line_type, regex, handler in self.line_matchers_and_handlers:
                            match = regex.match(line)
                            if match:
                                if handler:
                                    if handler(match):
                                        handled_line_type = line_type
                                        break
                                else:
                                    handled_line_type = line_type
                                    break

                        line_type_to_count[handled_line_type] += 1

                        if handled_line_type == 'other':
                            print(line)
            except KeyError:
                print('*** KeyError')
            finally:
                self.server.cleanup()

        for line_type, count in sorted(line_type_to_count.items(), key=lambda x: (-x[1], x[0])):
            print(line_type, count)


class Server:
    def __init__(self):
        self.client_id_to_username = {}
        self.game_id_to_game = {}

    def add_client(self, client_id, username):
        self.client_id_to_username[client_id] = username

    def handle_log(self, entry):
        game_id = entry['external-game-id'] if 'external-game-id' in entry else entry['game-id']
        internal_game_id = entry['game-id']

        if game_id in self.game_id_to_game:
            game = self.game_id_to_game[game_id]
        else:
            game = Game(game_id, internal_game_id)
            self.game_id_to_game[game_id] = game

        if entry['_'] == 'game-player':
            game.player_id_to_username[entry['player-id']] = entry['username']
        else:
            if 'state' in entry:
                game.state = entry['state']
            if 'mode' in entry:
                game.mode = entry['mode']
            if 'max-players' in entry:
                game.max_players = entry['max-players']
            if 'begin' in entry:
                game.begin = entry['begin']
            if 'end' in entry:
                game.end = entry['end']
            if 'score' in entry:
                game.score = entry['score']

    def destroy_game(self, game_id):
        game = self.game_id_to_game[game_id]
        print(game)
        del self.game_id_to_game[game_id]

    def cleanup(self):
        for game_id in list(self.game_id_to_game.keys()):
            self.destroy_game(game_id)


class Game:
    def __init__(self, game_id, internal_game_id):
        self.game_id = game_id
        self.internal_game_id = internal_game_id
        self.state = None
        self.mode = None
        self.max_players = None
        self.begin = None
        self.end = None
        self.score = None
        self.player_id_to_username = {}

    def __repr__(self):
        return str(self.__dict__)


def main():
    acquire_log_processor = AcquireLogProcessor()
    acquire_log_processor.go()


if __name__ == '__main__':
    main()
