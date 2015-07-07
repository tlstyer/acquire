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
            r'^Exception in callback ',
            r'^handle:',
            r'^ImportError:',
            r'^socket\.send\(\) raised exception\.$',
            r'^Traceback \(most recent call last\):',
            r'^UnicodeEncodeError:',
        ]

        self.line_matchers_and_handlers = [
            ('command to client', re.compile(r'^(?P<client_ids>[\d,]+) <- (?P<commands>.*)'), self.handle_command_to_client),
            ('ignore', re.compile('|'.join(regexes_to_ignore)), None),
            ('command to server', re.compile(r'^(?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
            ('log', re.compile(r'^(?P<entry>{.*)'), self.handle_log),
            ('connect v2', re.compile(r'^(?P<client_id>\d+) connect (?P<username>.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$'), self.handle_connect),
            ('disconnect', re.compile(r'^(\d+) disconnect$'), None),
            ('game expired', re.compile(r'^game #(?P<game_id>\d+) expired(?: \(internal #\d+\))?$'), self.handle_game_expired),
            ('connect v1', re.compile(r'^(?P<client_id>\d+) connect \d+\.\d+\.\d+\.\d+ (?P<username>.+)$'), self.handle_connect),
            ('disconnect after error', re.compile(r'^\d+ -> (\d+) disconnect$'), None),
            ('command to server after connect printing error', re.compile(r'^\d+ connect (?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
        ]

        command_to_client_entry_to_index = {entry: index for index, entry in enumerate(enums.lookups['CommandsToClient'])}
        self.commands_to_client_handlers = {
            command_to_client_entry_to_index['SetGameBoardCell']: self.handle_command_to_client__set_game_board_cell,
            command_to_client_entry_to_index['SetGamePlayerJoin']: self.handle_command_to_client__set_game_player_join,
            command_to_client_entry_to_index['SetGamePlayerRejoin']: self.handle_command_to_client__set_game_player_rejoin,
            command_to_client_entry_to_index['SetGameWatcherClientId']: self.handle_command_to_client__set_game_watcher_client_id,
            command_to_client_entry_to_index['ReturnWatcherToLobby']: self.handle_command_to_client__return_watcher_to_lobby,
            command_to_client_entry_to_index['SetTile']: self.handle_command_to_client__set_tile,
            command_to_client_entry_to_index['SetGamePlayerLeave']: self.handle_command_to_client__set_game_player_leave,
            command_to_client_entry_to_index['SetGamePlayerClientId']: self.handle_command_to_client__set_game_player_client_id,
        }

        command_to_server_entry_to_index = {entry: index for index, entry in enumerate(enums.lookups['CommandsToServer'])}
        self.commands_to_server_handlers = {
            command_to_server_entry_to_index['DoGameAction']: self.handle_command_to_server__do_game_action,
        }

        self.enum_set_game_board_cell = command_to_client_entry_to_index['SetGameBoardCell']
        self.enum_set_game_player = {index for entry, index in command_to_client_entry_to_index.items() if 'SetGamePlayer' in entry}

    def handle_command_to_client(self, match):
        client_ids = [int(x) for x in match.group('client_ids').split(',')]
        try:
            commands = ujson.decode(match.group('commands'))
        except ValueError:
            return

        try:
            self.commands_to_client_translator.translate(commands)

            # move SetGamePlayer* commands to the beginning if one of them is after a SetGameBoardCell command
            # reason: need to know what game the client belongs to
            enum_set_game_board_cell_indexes = set()
            enum_set_game_player_indexes = set()
            for index, command in enumerate(commands):
                if command[0] == self.enum_set_game_board_cell:
                    enum_set_game_board_cell_indexes.add(index)
                elif command[0] in self.enum_set_game_player:
                    enum_set_game_player_indexes.add(index)

            if enum_set_game_board_cell_indexes and enum_set_game_player_indexes and min(enum_set_game_board_cell_indexes) < min(enum_set_game_player_indexes):
                # SetGamePlayer* commands are always right next to each other when there's a SetGameBoardCell command in the batch
                min_index = min(enum_set_game_player_indexes)
                max_index = max(enum_set_game_player_indexes)
                commands = commands[min_index:max_index + 1] + commands[:min_index] + commands[max_index + 1:]

            for command in commands:
                handler = self.commands_to_client_handlers.get(command[0])
                if handler:
                    handler(client_ids, command)

            return True
        except:
            traceback.print_exc()

    def handle_command_to_client__set_game_player_join(self, client_ids, command):
        self.server.add_client_id_to_game(command[1], command[3])

    def handle_command_to_client__set_game_player_rejoin(self, client_ids, command):
        self.server.add_client_id_to_game(command[1], command[3])

    def handle_command_to_client__set_game_watcher_client_id(self, client_ids, command):
        self.server.add_client_id_to_game(command[1], command[2])

    def handle_command_to_client__return_watcher_to_lobby(self, client_ids, command):
        self.server.remove_client_id_from_game(command[2])

    def handle_command_to_client__set_tile(self, client_ids, command):
        self.server.set_tile(client_ids[0], command[2], command[3])

    def handle_command_to_client__set_game_board_cell(self, client_ids, command):
        self.server.set_game_board_cell(client_ids[0], command[1], command[2], command[3])

    def handle_command_to_client__set_game_player_leave(self, client_ids, command):
        self.server.remove_client_id_from_game(command[3])

    def handle_command_to_client__set_game_player_client_id(self, client_ids, command):
        if command[3] is None:
            self.server.remove_player_id_from_game(command[1], command[2])
        else:
            self.server.add_client_id_to_game(command[1], command[3])

    def handle_command_to_server(self, match):
        client_id = int(match.group('client_id'))
        try:
            command = ujson.decode(match.group('command'))
        except ValueError:
            return

        try:
            handler = self.commands_to_server_handlers.get(command[0])
            if handler:
                handler(client_id, command)

            return True
        except:
            traceback.print_exc()

    def handle_command_to_server__do_game_action(self, client_id, command):
        self.server.add_game_action(client_id, command[1:])

    def handle_log(self, match):
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

    def handle_connect(self, match):
        self.server.add_client(int(match.group('client_id')), match.group('username'))
        return True

    def go(self):
        line_type_to_count = {line_type: 0 for line_type, regex, handler in self.line_matchers_and_handlers}
        line_type_to_count['other'] = 0

        for timestamp, path in util.get_log_file_paths('py', begin=1408905413):
            print(path)

            self.server = Server(timestamp)

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
    def __init__(self, log_timestamp=None):
        self.log_timestamp = log_timestamp
        self.client_id_to_username = {}
        self.username_to_client_id = {}
        self.client_id_to_game_id = {}
        self.game_id_to_game = {}

    def add_client(self, client_id, username):
        self.client_id_to_username[client_id] = username
        self.username_to_client_id[username] = client_id

    def handle_log(self, entry):
        game_id = entry['external-game-id'] if 'external-game-id' in entry else entry['game-id']
        internal_game_id = entry['game-id']

        if game_id in self.game_id_to_game:
            game = self.game_id_to_game[game_id]
        else:
            game = Game(game_id, internal_game_id)
            self.game_id_to_game[game_id] = game

        if entry['_'] == 'game-player':
            player_id = entry['player-id']
            username = entry['username']

            game.player_id_to_username[player_id] = username
            game.username_to_player_id[username] = player_id

            if username not in game.player_join_order:
                game.player_join_order.append(username)
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
            if 'scores' in entry:
                game.score = entry['scores']

    def add_client_id_to_game(self, game_id, client_id):
        self.client_id_to_game_id[client_id] = game_id

    def remove_client_id_from_game(self, client_id):
        if client_id in self.client_id_to_game_id:
            del self.client_id_to_game_id[client_id]

    def remove_player_id_from_game(self, game_id, player_id):
        client_id = self.username_to_client_id[self.game_id_to_game[game_id].player_id_to_username[player_id]]
        if client_id in self.client_id_to_game_id:
            del self.client_id_to_game_id[client_id]

    def set_game_board_cell(self, client_id, x, y, game_board_type_id):
        game_id = self.client_id_to_game_id.get(client_id)
        game = self.game_id_to_game[game_id]
        if game.board[x][y] == Game.game_board_type__nothing:
            game.played_tiles_order.append((x, y))
        game.board[x][y] = game_board_type_id

    def set_tile(self, client_id, x, y):
        game_id = self.client_id_to_game_id.get(client_id)
        game = self.game_id_to_game[game_id]
        tile = (x, y)
        if tile not in game.tile_rack_tiles:
            game.tile_rack_tiles.add(tile)
            game.tile_rack_tiles_order.append(tile)

    def add_game_action(self, client_id, action):
        game_id = self.client_id_to_game_id.get(client_id)
        if game_id:
            game = self.game_id_to_game[game_id]
            player_id = game.username_to_player_id.get(self.client_id_to_username[client_id])
            if player_id is not None:
                game.actions.append([player_id, action])

    def destroy_game(self, game_id):
        game = self.game_id_to_game[game_id]
        print(game)
        del self.game_id_to_game[game_id]

    def cleanup(self):
        for game_id in list(self.game_id_to_game.keys()):
            self.destroy_game(game_id)


class Game:
    game_board_type__nothing = enums.lookups['GameBoardTypes'].index('Nothing')

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
        self.username_to_player_id = {}
        self.player_join_order = []
        self.board = [[Game.game_board_type__nothing for y in range(9)] for x in range(12)]
        self.played_tiles_order = []
        self.tile_rack_tiles = set()
        self.tile_rack_tiles_order = []
        self.actions = []

    def __repr__(self):
        return str(self.__dict__)


def main():
    acquire_log_processor = AcquireLogProcessor()
    acquire_log_processor.go()


if __name__ == '__main__':
    main()
