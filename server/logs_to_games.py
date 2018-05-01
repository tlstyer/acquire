#!/usr/bin/env python3

import collections
import enum
import enums
import itertools
import math
import os
import os.path
import orm
import pickle
import random
import re
import server
import sqlalchemy
import string
import sys
import traceback
import ujson
from username_to_user_id import username_to_user_id
import util


class Enums:
    lookups = {
        'CommandsToClient': list(enums.CommandsToClient.__members__.keys()) + ['SetGamePlayerUsername', 'SetGamePlayerClientId'],
        'Errors': list(enums.Errors.__members__.keys()),
    }

    _lookups_changes = {
        1417176502: {
            'CommandsToClient': [
                'FatalError',
                'SetClientId',
                'SetClientIdToData',
                'SetGameState',
                'SetGameBoardCell',
                'SetGameBoard',
                'SetScoreSheetCell',
                'SetScoreSheet',
                'SetGamePlayerUsername',
                'SetGamePlayerClientId',
                'SetGameWatcherClientId',
                'ReturnWatcherToLobby',
                'AddGameHistoryMessage',
                'AddGameHistoryMessages',
                'SetTurn',
                'SetGameAction',
                'SetTile',
                'SetTileGameBoardType',
                'RemoveTile',
                'AddGlobalChatMessage',
                'AddGameChatMessage',
                'DestroyGame',
            ],
        },
        1409233190: {
            'Errors': [
                'NotUsingLatestVersion',
                'InvalidUsername',
                'UsernameAlreadyInUse',
            ],
        },
    }

    _translations = {}

    @staticmethod
    def initialize():
        for timestamp, changes in Enums._lookups_changes.items():
            translation = {}
            for enum_name, entries in changes.items():
                entry_to_new_index = {entry: index for index, entry in enumerate(Enums.lookups[enum_name])}
                old_index_to_new_index = {index: entry_to_new_index[entry] for index, entry in enumerate(entries)}
                translation[enum_name] = old_index_to_new_index
            Enums._translations[timestamp] = translation

    @staticmethod
    def get_translations(timestamp):
        translations_for_timestamp = {}
        for trans_timestamp, trans_changes in sorted(Enums._translations.items(), reverse=True):
            if timestamp <= trans_timestamp:
                translations_for_timestamp.update(trans_changes)

        return translations_for_timestamp


Enums.initialize()


class CommandsToClientTranslator:
    def __init__(self, translations):
        self._commands_to_client = translations.get('CommandsToClient')
        self._errors = translations.get('Errors')

        self._fatal_error = enums.CommandsToClient.FatalError.value

    def translate(self, commands):
        if self._commands_to_client:
            for command in commands:
                command[0] = self._commands_to_client[command[0]]

        if self._errors:
            for command in commands:
                if command[0] == self._fatal_error:
                    command[1] = self._errors[command[1]]


class LineTypes(enum.Enum):
    time = 0
    connect = 1
    disconnect = 2
    command_to_client = 3
    command_to_server = 4
    game_expired = 5
    log = 6
    blank_line = 7
    connection_made = 8
    error = 9


class LogParser:
    def __init__(self, log_timestamp, file):
        self._file = file

        regexes_to_ignore = [
            r'^ ',
            r'^AttributeError:',
            r'^connection_lost$',
            r'^Exception in callback ',
            r'^handle:',
            r'^ImportError:',
            r'^socket\.send\(\) raised exception\.$',
            r'^Traceback \(most recent call last\):',
            r'^UnicodeEncodeError:',
        ]

        self._line_matchers_and_handlers = [
            (LineTypes.time, re.compile(r'^time: (?P<time>[\d\.]+)$'), self._handle_time),
            (LineTypes.command_to_client, re.compile(r'^(?P<client_ids>[\d,]+) <- (?P<commands>.*)'), self._handle_command_to_client),
            (LineTypes.blank_line, re.compile(r'^$'), None),
            (LineTypes.command_to_server, re.compile(r'^(?P<client_id>\d+) -> (?P<command>.*)'), self._handle_command_to_server),
            (LineTypes.log, re.compile(r'^(?P<entry>{.*)'), self._handle_log),
            (LineTypes.connect, re.compile(r'^(?P<client_id>\d+) connect (?P<username>.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$'), self._handle_connect),
            (LineTypes.disconnect, re.compile(r'^(?P<client_id>\d+) disconnect$'), self._handle_disconnect),
            (LineTypes.game_expired, re.compile(r'^game #(?P<game_id>\d+) expired(?: \(internal #\d+\))?$'), self._handle_game_expired),
            (LineTypes.connect, re.compile(r'^(?P<client_id>\d+) connect \d+\.\d+\.\d+\.\d+ (?P<username>.+)$'), self._handle_connect),
            (LineTypes.disconnect, re.compile(r'^\d+ -> (?P<client_id>\d+) disconnect$'), self._handle_disconnect),  # disconnect after error
            (LineTypes.command_to_server, re.compile(r'^\d+ connect (?P<client_id>\d+) -> (?P<command>.*)'), self._handle_command_to_server),  # command to server after connect printing error
            (LineTypes.connection_made, re.compile(r'^connection_made$'), self._handle_connection_made),
            (LineTypes.error, re.compile('|'.join(regexes_to_ignore)), None),
        ]

        enums_translations = Enums.get_translations(log_timestamp)
        self._commands_to_client_translator = CommandsToClientTranslator(enums_translations)

        self._connection_made_count = 0

        self._enum_set_game_board_cell = enums.CommandsToClient.SetGameBoardCell.value
        self._enum_set_game_player = {index for index, entry in enumerate(Enums.lookups['CommandsToClient']) if 'SetGamePlayer' in entry}

    def go(self):
        handled_line_type = None
        line_number = 0
        stop_processing_file = False

        for line in self._file:
            line_number += 1

            if len(line) and line[-1] == '\n':
                line = line[:-1]

            handled_line_type = None
            parse_line_data = None

            for line_type, regex, handler in self._line_matchers_and_handlers:
                match = regex.match(line)
                if match:
                    handled_line_type = line_type
                    if handler:
                        parse_line_data = handler(match)

                        if parse_line_data is None:
                            handled_line_type = None
                            continue
                        elif parse_line_data == 'stop':
                            stop_processing_file = True
                            break
                        else:
                            break
                    else:
                        parse_line_data = ()
                        break

            if stop_processing_file:
                break

            yield handled_line_type, line_number, line, parse_line_data

        # make sure last line type is always LineTypes.blank_line
        if handled_line_type != LineTypes.blank_line:
            yield LineTypes.blank_line, line_number + 1, '', ()

    def _handle_time(self, match):
        return float(match.group('time')),

    def _handle_command_to_client(self, match):
        try:
            client_ids = [int(x) for x in match.group('client_ids').split(',')]
            commands = ujson.decode(match.group('commands'))
        except ValueError:
            return

        self._commands_to_client_translator.translate(commands)

        # move SetGamePlayer* commands to the beginning if one of them is after a SetGameBoardCell command
        # reason: need to know what game the client belongs to
        enum_set_game_board_cell_indexes = set()
        enum_set_game_player_indexes = set()
        for index, command in enumerate(commands):
            if command[0] == self._enum_set_game_board_cell:
                enum_set_game_board_cell_indexes.add(index)
            elif command[0] in self._enum_set_game_player:
                enum_set_game_player_indexes.add(index)

        if enum_set_game_board_cell_indexes and enum_set_game_player_indexes and min(enum_set_game_board_cell_indexes) < min(enum_set_game_player_indexes):
            # SetGamePlayer* commands are always right next to each other when there's a SetGameBoardCell command in the batch
            min_index = min(enum_set_game_player_indexes)
            max_index = max(enum_set_game_player_indexes)
            commands = commands[min_index:max_index + 1] + commands[:min_index] + commands[max_index + 1:]

        return client_ids, commands

    def _handle_command_to_server(self, match):
        try:
            client_id = int(match.group('client_id'))
            command = ujson.decode(match.group('command'))
        except ValueError:
            return

        return client_id, command

    def _handle_log(self, match):
        try:
            entry = ujson.decode(match.group('entry'))
        except ValueError:
            return

        return entry,

    def _handle_connect(self, match):
        return int(match.group('client_id')), match.group('username')

    def _handle_disconnect(self, match):
        return int(match.group('client_id')),

    def _handle_game_expired(self, match):
        return int(match.group('game_id')),

    def _handle_connection_made(self, match):
        self._connection_made_count += 1
        if self._connection_made_count == 1:
            return ()
        else:
            return 'stop'


class LogProcessor:
    _game_board_type__nothing = enums.GameBoardTypes.Nothing.value

    _line_type_processing_priorities = {
        LineTypes.time: 0,
        LineTypes.log: 1,
        LineTypes.connection_made: 2,
        LineTypes.connect: 3,
        LineTypes.game_expired: 4,
        LineTypes.command_to_server: 5,
        LineTypes.command_to_client: 6,
        LineTypes.disconnect: 7,
        LineTypes.error: 8,
        LineTypes.blank_line: 9,
    }

    def __init__(self, log_timestamp, file, verbose=False, verbose_output_path=''):
        self._log_timestamp = log_timestamp
        self._verbose = verbose
        self._verbose_output_path = verbose_output_path

        self._client_id_to_username = {}
        self._username_to_client_id = {}
        self._client_id_to_game_id = {}
        self._game_id_to_game = {}

        self._log_parser = LogParser(log_timestamp, file)

        self._line_type_to_handler = {
            LineTypes.time: self._handle_time,
            LineTypes.connect: self._handle_connect,
            LineTypes.disconnect: self._handle_disconnect,
            LineTypes.command_to_client: self._handle_command_to_client,
            LineTypes.command_to_server: self._handle_command_to_server,
            LineTypes.game_expired: self._handle_game_expired,
            LineTypes.log: self._handle_log,
            LineTypes.blank_line: self._handle_blank_line,
            LineTypes.connection_made: self._handle_blank_line,
            LineTypes.error: self._handle_blank_line,
        }

        self._commands_to_client_handlers = {
            # FatalError
            # SetClientId
            # SetClientIdToData
            # SetGameState
            enums.CommandsToClient.SetGameBoardCell.value: self._handle_command_to_client__set_game_board_cell,
            # SetGameBoard
            enums.CommandsToClient.SetScoreSheetCell.value: self._handle_command_to_client__set_score_sheet_cell,
            enums.CommandsToClient.SetScoreSheet.value: self._handle_command_to_client__set_score_sheet,
            enums.CommandsToClient.SetGamePlayerJoin.value: self._handle_command_to_client__set_game_player_join,
            enums.CommandsToClient.SetGamePlayerRejoin.value: self._handle_command_to_client__set_game_player_rejoin,
            enums.CommandsToClient.SetGamePlayerLeave.value: self._handle_command_to_client__set_game_player_leave,
            # SetGamePlayerJoinMissing
            enums.CommandsToClient.SetGameWatcherClientId.value: self._handle_command_to_client__set_game_watcher_client_id,
            enums.CommandsToClient.ReturnWatcherToLobby.value: self._handle_command_to_client__return_watcher_to_lobby,
            enums.CommandsToClient.AddGameHistoryMessage.value: self._handle_command_to_client__add_game_history_message,
            enums.CommandsToClient.AddGameHistoryMessages.value: self._handle_command_to_client__add_game_history_messages,
            # SetTurn
            # SetGameAction
            enums.CommandsToClient.SetTile.value: self._handle_command_to_client__set_tile,
            # SetTileGameBoardType
            enums.CommandsToClient.RemoveTile.value: self._handle_command_to_client__remove_tile,
            # AddGlobalChatMessage
            # AddGameChatMessage
            # DestroyGame
            # # defunct
            # SetGamePlayerUsername
            Enums.lookups['CommandsToClient'].index('SetGamePlayerClientId'): self._handle_command_to_client__set_game_player_client_id,
        }

        self._commands_to_server_handlers = {
            # CreateGame
            # JoinGame
            # RejoinGame
            # WatchGame
            # LeaveGame
            enums.CommandsToServer.DoGameAction.value: self._handle_command_to_server__do_game_action,
            # SendGlobalChatMessage
            # SendGameChatMessage
        }

        self._expired_games = []

        self._line_number = 0

        self._timestamp = None

    def go(self):
        line_group = []

        for line_type, line_number, line, parse_line_data in self._log_parser.go():
            if self._verbose:
                self._line_number = line_number
                print(line)

            line_group.append((line_type, parse_line_data))

            if line_type == LineTypes.blank_line:
                line_group.sort(key=lambda line: LogProcessor._line_type_processing_priorities.get(line[0], -1))

                for line_type, parse_line_data in line_group:
                    handler = self._line_type_to_handler.get(line_type)
                    if handler:
                        handler(*parse_line_data)

                line_group = []

            if self._expired_games:
                for game in self._expired_games:
                    yield game
                self._expired_games = []

        for game in self._game_id_to_game.values():
            yield game

    def _handle_time(self, time):
        self._timestamp = time

    def _handle_connect(self, client_id, username):
        self._client_id_to_username[client_id] = username
        self._username_to_client_id[username] = client_id

    def _handle_disconnect(self, client_id):
        del self._client_id_to_username[client_id]
        self._username_to_client_id = {username: client_id for client_id, username in self._client_id_to_username.items()}

        if len(self._client_id_to_username) != len(self._username_to_client_id):
            print('remove_client: huh?')
            print(self._client_id_to_username)
            print(self._username_to_client_id)

    def _handle_command_to_client(self, client_ids, commands):
        if self._verbose:
            print('~~~', [self._client_id_to_username.get(client_id) for client_id in client_ids])
        for command in commands:
            try:
                if self._verbose:
                    print('~~~', Enums.lookups['CommandsToClient'][command[0]], command)
                handler = self._commands_to_client_handlers.get(command[0])
                if handler:
                    handler(client_ids, command)
            except:
                traceback.print_exc()

    def _handle_command_to_client__set_game_board_cell(self, client_ids, command):
        client_id, x, y, game_board_type_id = client_ids[0], command[1], command[2], command[3]

        game = self._game_id_to_game[self._client_id_to_game_id[client_id]]

        if game.board[x][y] == LogProcessor._game_board_type__nothing:
            tile = (x, y)

            game.played_tiles_order.append(tile)

            # remove tile from tile racks
            for tile_rack in game.tile_racks[:len(game.player_id_to_username)]:
                for index, entry in enumerate(tile_rack):
                    if entry == tile:
                        tile_rack[index] = None
                        break

        game.board[x][y] = game_board_type_id

    def _handle_command_to_client__set_score_sheet_cell(self, client_ids, command):
        client_id, row, index, value = client_ids[0], command[1], command[2], command[3]

        game = self._game_id_to_game[self._client_id_to_game_id[client_id]]

        if row < 6:
            game.score_sheet_players[row][index] = value
        else:
            game.score_sheet_chain_size[index] = value

    def _handle_command_to_client__set_score_sheet(self, client_ids, command):
        client_id, score_sheet_data = client_ids[0], command[1]

        game = self._game_id_to_game[self._client_id_to_game_id[client_id]]

        game.score_sheet_players[:len(score_sheet_data[0])] = score_sheet_data[0]
        game.score_sheet_chain_size = score_sheet_data[1]

    def _handle_command_to_client__set_game_player_join(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_player_rejoin(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_player_leave(self, client_ids, command):
        self._remove_client_id_from_game(command[3])

    def _handle_command_to_client__set_game_watcher_client_id(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[2])

    def _handle_command_to_client__return_watcher_to_lobby(self, client_ids, command):
        self._remove_client_id_from_game(command[2])

    def _handle_command_to_client__add_game_history_message(self, client_ids, command):
        printed_message = False
        for client_id in client_ids:
            game = self._game_id_to_game[self._client_id_to_game_id[client_id]]
            username = self._client_id_to_username[client_id]
            player_id = game.username_to_player_id.get(username)
            if player_id is not None:
                game.username_to_game_history[username].append(game.translate_add_game_history_message(command[1:]))
                if self._verbose and not printed_message:
                    message = game.username_to_game_history[username][-1]
                    print('  ~~~', enums.GameHistoryMessages(message[0]).name, message)
                    printed_message = True

    def _handle_command_to_client__add_game_history_messages(self, client_ids, command):
        for client_id in client_ids:
            game = self._game_id_to_game[self._client_id_to_game_id[client_id]]
            username = self._client_id_to_username[client_id]
            player_id = game.username_to_player_id.get(username)
            if player_id is not None:
                game.username_to_game_history[username] = [game.translate_add_game_history_message(message) for message in command[1]]
                if self._verbose:
                    for message in game.username_to_game_history[username]:
                        print('  ~~~', enums.GameHistoryMessages(message[0]).name, message)

    def _handle_command_to_client__set_tile(self, client_ids, command):
        client_id, tile_index, x, y = client_ids[0], command[1], command[2], command[3]

        game = self._game_id_to_game[self._client_id_to_game_id[client_id]]

        player_id = game.username_to_player_id[self._client_id_to_username[client_id]]
        tile = (x, y)

        if game.initial_tile_racks[player_id][tile_index] is None:
            game.tile_rack_tiles.add(tile)
            game.initial_tile_racks[player_id][tile_index] = tile
        elif tile not in game.tile_rack_tiles:
            game.tile_rack_tiles.add(tile)
            game.additional_tile_rack_tiles_order.append(tile)

        game.tile_racks[player_id][tile_index] = tile

    def _handle_command_to_client__remove_tile(self, client_ids, command):
        client_id, tile_index = client_ids[0], command[1]

        game = self._game_id_to_game[self._client_id_to_game_id[client_id]]

        player_id = game.username_to_player_id[self._client_id_to_username[client_id]]

        game.tile_racks[player_id][tile_index] = None

    def _handle_command_to_client__set_game_player_client_id(self, client_ids, command):
        if command[3] is None:
            self._remove_player_id_from_game(command[1], command[2])
        else:
            self._add_client_id_to_game(command[1], command[3])

    def _add_client_id_to_game(self, game_id, client_id):
        self._client_id_to_game_id[client_id] = game_id

    def _remove_client_id_from_game(self, client_id):
        if client_id in self._client_id_to_game_id:
            del self._client_id_to_game_id[client_id]

    def _remove_player_id_from_game(self, game_id, player_id):
        game = self._game_id_to_game.get(game_id)

        if game:
            client_id = self._username_to_client_id[game.player_id_to_username[player_id]]

            if client_id in self._client_id_to_game_id:
                del self._client_id_to_game_id[client_id]

    def _handle_command_to_server(self, client_id, command):
        try:
            if self._verbose:
                print('~~~', self._client_id_to_username.get(client_id))
                command_name = enums.CommandsToServer(command[0]).name
                print('~~~', command_name, command)
                if command_name == 'DoGameAction':
                    print('  ~~~', enums.GameActions(command[1]).name, command[1:])
            handler = self._commands_to_server_handlers.get(command[0])
            if handler:
                handler(client_id, command)
        except:
            traceback.print_exc()

    def _handle_command_to_server__do_game_action(self, client_id, command):
        game_id = self._client_id_to_game_id.get(client_id)

        if game_id:
            game = self._game_id_to_game[game_id]
            player_id = game.username_to_player_id.get(self._client_id_to_username[client_id])

            if player_id is not None:
                game.actions.append([player_id, command[1:], self._timestamp])

    def _handle_game_expired(self, game_id):
        game = self._game_id_to_game[game_id]

        game.expired = True
        self._expired_games.append(game)

        del self._game_id_to_game[game_id]

    def _handle_log(self, entry):
        game_id = entry['external-game-id'] if 'external-game-id' in entry else entry['game-id']
        internal_game_id = entry['game-id']

        if game_id in self._game_id_to_game:
            game = self._game_id_to_game[game_id]
        else:
            game = Game(self._log_timestamp, game_id, internal_game_id, self._verbose)
            self._game_id_to_game[game_id] = game

        if entry['_'] == 'game-player':
            player_id = entry['player-id']
            username = entry['username']

            game.player_id_to_username[player_id] = username
            game.username_to_player_id[username] = player_id

            if username not in game.player_join_order:
                game.player_join_order.append(username)

            if username not in game.username_to_game_history:
                game.username_to_game_history[username] = []
        else:
            if 'state' in entry:
                game.state = entry['state']
            if 'mode' in entry:
                game.mode = entry['mode']
            if 'max-players' in entry:
                game.max_players = entry['max-players']
            if 'tile-bag' in entry:
                game.tile_bag = [tuple(x) for x in entry['tile-bag']]
            if 'begin' in entry:
                game.begin = entry['begin']
                if self._timestamp is None:
                    self._timestamp = entry['begin']
            if 'end' in entry:
                game.end = entry['end']
                if self._timestamp is None:
                    self._timestamp = entry['end']
            if 'score' in entry:
                game.score = entry['score']
            if 'scores' in entry:
                game.score = entry['scores']

    def _handle_blank_line(self):
        if self._verbose:
            for game in self._game_id_to_game.values():
                game.make_server_game()
                game.compare_with_server_game()

                if self._verbose_output_path:
                    filename = os.path.join(self._verbose_output_path, '%d_%05d_%06d.bin' % (game.log_timestamp, game.internal_game_id, self._line_number))
                    game.make_server_game_file(filename)
                    print('\n'.join(game.sync_log))

                messages = [game.log_timestamp, game.internal_game_id, self._line_number]
                if game.is_server_game_synchronized:
                    messages.append('yay!')
                else:
                    messages.append('boo!')
                print(*messages)
                print()
                print()

        self._timestamp = None


class Game:
    _game_board_type__nothing = enums.GameBoardTypes.Nothing.value
    _game_history_messages__drew_position_tile = enums.GameHistoryMessages.DrewPositionTile.value
    _score_sheet_indexes__client = enums.ScoreSheetIndexes.Client.value
    _turn_began_message_id = enums.GameHistoryMessages.TurnBegan.value
    _drew_or_replaced_tile_message_ids = {enums.GameHistoryMessages.DrewPositionTile.value, enums.GameHistoryMessages.DrewTile.value, enums.GameHistoryMessages.ReplacedDeadTile.value}

    tile_bag_tweaks = {
        (1414827614, 43): [[34, (1, 5)]],
        (1415355783, 106): [[68, (11, 1)]],
        (1421578193, 3366): [[80, (9, 6)]],
        (1427270069, 3903): [[53, (0, 8)]],
        (1430041771, 1330): [[63, (0, 8)]],
        (1432033655, 1965): [[91, (5, 5)]],
        (1433241253, 1336): [[69, (7, 5)]],
        (1433837429, 1110): [[73, (7, 1)]],
        (1435226336, 3165): [[88, (2, 7)], [89, (11, 3)]],
        (1435226336, 5690): [[101, (10, 7)]],
    }

    def __init__(self, log_timestamp, game_id, internal_game_id, verbose):
        self.log_timestamp = log_timestamp
        self.game_id = game_id
        self.internal_game_id = internal_game_id
        self._verbose = verbose
        self.state = None
        self.mode = None
        self.max_players = None
        self.tile_bag = None
        self.begin = None
        self.end = None
        self.score = None
        self.player_id_to_username = {}
        self.username_to_player_id = {}
        self.player_join_order = []
        self.board = [[Game._game_board_type__nothing for y in range(9)] for x in range(12)]
        self.score_sheet_players = [[0, 0, 0, 0, 0, 0, 0, 60] for x in range(6)]
        self.score_sheet_chain_size = [0, 0, 0, 0, 0, 0, 0]
        self.played_tiles_order = []
        self.tile_rack_tiles = set()
        self.initial_tile_racks = [[None, None, None, None, None, None] for x in range(6)]
        self.tile_racks = [[None, None, None, None, None, None] for x in range(6)]
        self.additional_tile_rack_tiles_order = []
        self.actions = []
        self.username_to_game_history = {}
        self.expired = False

        self.server_game = None
        self._server_game_player_id_to_client = None
        self.is_server_game_synchronized = None
        self.sync_log = None

    def translate_add_game_history_message(self, message):
        if message[0] == Game._game_history_messages__drew_position_tile:
            if isinstance(message[1], int):
                message = message[:1] + [self.player_id_to_username[message[1]]] + message[2:]

        return message

    def make_server_game(self):
        tile_bag = self._get_initial_tile_bag()

        self.server_game = server.Game(self.game_id, self.internal_game_id, enums.GameModes[self.mode].value, self.max_players, Game._add_pending_messages, False, tile_bag)

        self._server_game_player_id_to_client = [Client(player_id, username) for player_id, username in sorted(self.player_id_to_username.items())]

        for username in self.player_join_order:
            client = self._server_game_player_id_to_client[self.username_to_player_id[username]]
            self.server_game.join_game(client)

        for _, player_id_and_action_and_timestamp in enumerate(self.actions):
            player_id, action, _ = player_id_and_action_and_timestamp

            game_action_id = action[0]
            data = action[1:]
            try:
                self.server_game.do_game_action(self._server_game_player_id_to_client[player_id], game_action_id, data)
            except:
                pass

    def compare_with_server_game(self):
        num_players = len(self.player_id_to_username)

        self.is_server_game_synchronized = True
        self.sync_log = []

        # board
        self._sync_compare('board', self.board, self.server_game.game_board.x_to_y_to_board_type)

        # score sheet players
        self._sync_compare('score_sheet_players', self.score_sheet_players[:num_players], [x[:8] for x in self.server_game.score_sheet.player_data])

        # score sheet chain size
        self._sync_compare('score_sheet_chain_size', self.score_sheet_chain_size, self.server_game.score_sheet.chain_size)

        # tile racks
        if self.server_game.tile_racks:
            server_tile_racks = [[tile_data[0] if tile_data else None for tile_data in rack] for rack in self.server_game.tile_racks.racks]

            self._sync_compare('tile_racks', self.tile_racks[:num_players], server_tile_racks)

        # player id to game history
        local_player_id_to_game_history = [self.username_to_game_history[username] for username in self.player_id_to_username.values()]

        server_player_id_to_game_history = [[] for x in range(len(self.server_game.score_sheet.username_to_player_id))]
        for target_player_id, message in self.server_game.history_messages:
            if target_player_id is None:
                for game_history in server_player_id_to_game_history:
                    game_history.append(message)
            else:
                server_player_id_to_game_history[target_player_id].append(message)

        if self._verbose:
            self.sync_log.append('player_id_to_game_history:')
            for username in self.player_id_to_username.values():
                self.sync_log.append(str(self.username_to_game_history[username]))

        for player_id, local_game_history, server_game_history in zip(range(len(local_player_id_to_game_history)), local_player_id_to_game_history, server_player_id_to_game_history):
            server_game_history_under_consideration = server_game_history[:len(local_game_history)]
            if local_game_history != server_game_history_under_consideration:
                self.is_server_game_synchronized = False
                self.sync_log.append('player_id_to_game_history diff for player_id ' + str(player_id) + '!')
                self.sync_log.append(str(local_game_history))
                self.sync_log.append(str(server_game_history_under_consideration))

    def _sync_compare(self, name, first, second):
        str_first = str(first)
        str_second = str(second)

        if self._verbose:
            self.sync_log.append(name + ': ' + str_first)

        if str_first != str_second:
            self.is_server_game_synchronized = False

            if name == 'tile_racks':
                for player_id, rack1, rack2 in zip(range(len(first)), first, second):
                    if rack1 != rack2:
                        self.sync_log.append(name + ' diff for player_id ' + str(player_id) + '!')
                        self.sync_log.append(str(rack1))
                        self.sync_log.append(str(rack2))
            else:
                self.sync_log.append(name + ' diff!')
                self.sync_log.append(str_first)
                self.sync_log.append(str_second)

    def _get_initial_tile_bag(self):
        if self.tile_bag:
            return list(self.tile_bag)

        player_id_to_game_history = [self.username_to_game_history[username] for username in self.player_id_to_username.values()]

        player_id_to_turn_by_turn_tiles_drawn_or_replaced = []
        for game_history in player_id_to_game_history:
            turn_by_turn_tiles_drawn_or_replaced = []
            turn_tiles_drawn_or_replaced = []

            for message in game_history:
                if message[0] in Game._drew_or_replaced_tile_message_ids:
                    turn_tiles_drawn_or_replaced.append((message[2], message[3]))
                elif message[0] == Game._turn_began_message_id:
                    turn_by_turn_tiles_drawn_or_replaced.append(turn_tiles_drawn_or_replaced)
                    turn_tiles_drawn_or_replaced = []
            turn_by_turn_tiles_drawn_or_replaced.append(turn_tiles_drawn_or_replaced)

            player_id_to_turn_by_turn_tiles_drawn_or_replaced.append(turn_by_turn_tiles_drawn_or_replaced)

        included_tiles = set()
        tile_bag = []

        index = 0
        if self._verbose:
            max_len = max(len(x) for x in player_id_to_turn_by_turn_tiles_drawn_or_replaced)

            print('all:')
            for turn_by_turn_tiles_drawn_or_replaced in player_id_to_turn_by_turn_tiles_drawn_or_replaced:
                print(turn_by_turn_tiles_drawn_or_replaced)

        for players_tiles_by_turn in itertools.zip_longest(*player_id_to_turn_by_turn_tiles_drawn_or_replaced):
            if self._verbose:
                index += 1
                if index == max_len:
                    print('before:')
                    for player_tiles_by_turn in players_tiles_by_turn:
                        print(player_tiles_by_turn)

            # put current player's tiles first. current player will have more tiles.
            players_tiles_by_turn = sorted([player_tiles_by_turn for player_tiles_by_turn in players_tiles_by_turn if player_tiles_by_turn], key=lambda x: -len(x))

            if self._verbose:
                if index == max_len:
                    print('after:')
                    for player_tiles_by_turn in players_tiles_by_turn:
                        print(player_tiles_by_turn)

            for player_tiles_by_turn in players_tiles_by_turn:
                if player_tiles_by_turn:
                    for tile in player_tiles_by_turn:
                        if tile not in included_tiles:
                            included_tiles.add(tile)
                            tile_bag.append(tile)

        if self._verbose:
            print('len(tile_bag):', len(tile_bag))

        remaining_tiles = {(x, y) for x in range(12) for y in range(9)} - included_tiles

        # do tile bag tweaks
        tile_bag_tweaks = Game.tile_bag_tweaks.get((self.log_timestamp, self.internal_game_id))
        if tile_bag_tweaks:
            for index, tile in tile_bag_tweaks:
                if len(tile_bag) >= index:
                    if tile is None:
                        tile = random.sample(remaining_tiles, 1)[0]
                        if self._verbose:
                            print('random tile chosen for insertion:', tile)
                    else:
                        if self._verbose:
                            print('specified tile for insertion:', tile)
                    tile_bag.insert(index, tile)
                    remaining_tiles.remove(tile)

        remaining_tiles = list(remaining_tiles)
        random.seed(str(self.log_timestamp) + '-' + str(self.internal_game_id))
        random.shuffle(remaining_tiles)
        tile_bag.extend(remaining_tiles)
        tile_bag.reverse()

        return tile_bag

    def make_server_game_file(self, filename):
        game_data = {}

        game_data['game_id'] = self.server_game.game_id
        game_data['internal_game_id'] = self.server_game.internal_game_id
        game_data['state'] = self.server_game.state
        game_data['mode'] = self.server_game.mode
        game_data['max_players'] = self.server_game.max_players
        game_data['num_players'] = self.server_game.num_players
        game_data['tile_bag'] = self.server_game.tile_bag
        game_data['turn_player_id'] = self.server_game.turn_player_id
        game_data['turns_without_played_tiles_count'] = self.server_game.turns_without_played_tiles_count
        game_data['history_messages'] = self.server_game.history_messages

        # game_data['add_pending_messages'] -- exclude
        # game_data['logging_enabled'] -- exclude
        # game_data['client_ids'] -- exclude
        # game_data['watcher_client_ids'] -- exclude
        # game_data['expiration_time'] -- exclude

        game_data['game_board'] = self.server_game.game_board.x_to_y_to_board_type

        score_sheet = self.server_game.score_sheet
        game_data['score_sheet'] = {
            'player_data': [row[:Game._score_sheet_indexes__client] + [None] for row in score_sheet.player_data],
            'available': score_sheet.available,
            'chain_size': score_sheet.chain_size,
            'price': score_sheet.price,
            'creator_username': score_sheet.creator_username,
            'username_to_player_id': score_sheet.username_to_player_id,
        }

        game_data['tile_racks'] = self.server_game.tile_racks.racks if self.server_game.tile_racks else None

        game_data_actions = []
        for action in self.server_game.actions:
            game_data_action = dict(action.__dict__)
            game_data_action['__name__'] = action.__class__.__name__
            del game_data_action['game']
            game_data_actions.append(game_data_action)
        game_data['actions'] = game_data_actions

        game_data['log_time'] = self.log_timestamp
        game_data['begin'] = self.begin
        game_data['end'] = self.end

        with open(filename, 'wb') as f:
            pickle.dump(game_data, f)

    @staticmethod
    def _add_pending_messages(messages, client_ids=None):
        pass


class Client:
    def __init__(self, player_id, username):
        self.client_id = player_id + 1
        self.username = username
        self.game_id = None
        self.player_id = None


class IndividualGameLogMaker:
    def __init__(self, log_timestamp, file):
        self._log_timestamp = log_timestamp

        self._client_id_to_username = {}
        self._username_to_client_id = {}
        self._client_id_to_game_id = {}

        self._log_parser = LogParser(log_timestamp, file)

        self._line_type_to_handler = {
            LineTypes.connect: self._handle_connect,
            LineTypes.disconnect: self._handle_disconnect,
            LineTypes.command_to_client: self._handle_command_to_client,
            LineTypes.command_to_server: self._handle_command_to_server,
            LineTypes.game_expired: self._handle_game_expired,
            LineTypes.log: self._handle_log,
            LineTypes.blank_line: self._handle_blank_line,
            LineTypes.connection_made: self._handle_blank_line,
            LineTypes.error: self._handle_blank_line,
        }

        self._commands_to_client_handlers = {
            # FatalError
            # SetClientId
            # SetClientIdToData
            # SetGameState
            enums.CommandsToClient.SetGameBoardCell.value: self._handle_command_to_client__set_game_board_cell,
            # SetGameBoard
            enums.CommandsToClient.SetScoreSheetCell.value: self._handle_command_to_client__set_score_sheet_cell,
            enums.CommandsToClient.SetScoreSheet.value: self._handle_command_to_client__set_score_sheet,
            enums.CommandsToClient.SetGamePlayerJoin.value: self._handle_command_to_client__set_game_player_join,
            enums.CommandsToClient.SetGamePlayerRejoin.value: self._handle_command_to_client__set_game_player_rejoin,
            enums.CommandsToClient.SetGamePlayerLeave.value: self._handle_command_to_client__set_game_player_leave,
            # SetGamePlayerJoinMissing
            enums.CommandsToClient.SetGameWatcherClientId.value: self._handle_command_to_client__set_game_watcher_client_id,
            enums.CommandsToClient.ReturnWatcherToLobby.value: self._handle_command_to_client__return_watcher_to_lobby,
            # AddGameHistoryMessage
            # AddGameHistoryMessages
            # SetTurn
            # SetGameAction
            enums.CommandsToClient.SetTile.value: self._handle_command_to_client__set_tile,
            # SetTileGameBoardType
            # RemoveTile
            # AddGlobalChatMessage
            # AddGameChatMessage
            # DestroyGame
            # # defunct
            # SetGamePlayerUsername
            Enums.lookups['CommandsToClient'].index('SetGamePlayerClientId'): self._handle_command_to_client__set_game_player_client_id,
        }

        self._commands_to_server_handlers = {
            # CreateGame
            # JoinGame
            # RejoinGame
            # WatchGame
            # LeaveGame
            enums.CommandsToServer.DoGameAction.value: self._handle_command_to_server__do_game_action,
            # SendGlobalChatMessage
            # SendGameChatMessage
        }

        self._delayed_calls = []

        self._line_number = 1
        self._batch_line_number = 1
        self._batch = []

        self._game_id_to_game_log = {}
        self._batch_add_client_id = None
        self._batch_remove_client_id = None
        self._batch_game_id = None
        self._batch_game_client_ids = []
        self._batch_destroy_game_ids = []
        self._client_id_to_add_batch = {}
        self._re_disconnect = re.compile(r'^\d+ disconnect$')

        self._completed_game_logs = []

    def go(self):
        for line_type, line_number, line, parse_line_data in self._log_parser.go():
            self._batch.append(line)

            handler = self._line_type_to_handler.get(line_type)
            if handler:
                self._line_number = line_number
                handler(*parse_line_data)

            if self._completed_game_logs:
                for game_log in self._completed_game_logs:
                    yield game_log
                self._completed_game_logs = []

        for game_id in self._game_id_to_game_log.keys():
            self._handle_game_expired(game_id)
        self._batch_completed(None, None)

        for game_log in self._completed_game_logs:
            yield game_log

    def _handle_connect(self, client_id, username):
        if self._client_id_to_username.get(client_id) != username:
            self._batch_add_client_id = client_id

        self._client_id_to_username[client_id] = username
        self._username_to_client_id[username] = client_id

    def _handle_disconnect(self, client_id):
        self._delayed_calls.append([self._handle_disconnect__delayed, [client_id]])

    def _handle_disconnect__delayed(self, client_id):
        if self._client_id_to_username.get(client_id):
            self._batch_remove_client_id = client_id

        del self._client_id_to_username[client_id]
        self._username_to_client_id = {username: client_id for client_id, username in self._client_id_to_username.items()}

        if len(self._client_id_to_username) != len(self._username_to_client_id):
            print('remove_client: huh?')
            print(self._client_id_to_username)
            print(self._username_to_client_id)

    def _handle_command_to_client(self, client_ids, commands):
        for command in commands:
            try:
                handler = self._commands_to_client_handlers.get(command[0])
                if handler:
                    handler(client_ids, command)
            except:
                traceback.print_exc()

    def _handle_command_to_client__set_game_board_cell(self, client_ids, command):
        self._batch_game_id = self._client_id_to_game_id[client_ids[0]]

    def _handle_command_to_client__set_score_sheet_cell(self, client_ids, command):
        self._batch_game_id = self._client_id_to_game_id[client_ids[0]]

    def _handle_command_to_client__set_score_sheet(self, client_ids, command):
        self._batch_game_id = self._client_id_to_game_id[client_ids[0]]

    def _handle_command_to_client__set_game_player_join(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_player_rejoin(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_player_leave(self, client_ids, command):
        self._remove_client_id_from_game(command[3])

    def _handle_command_to_client__set_game_watcher_client_id(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[2])

    def _handle_command_to_client__return_watcher_to_lobby(self, client_ids, command):
        self._remove_client_id_from_game(command[2])

    def _handle_command_to_client__set_tile(self, client_ids, command):
        self._batch_game_id = self._client_id_to_game_id[client_ids[0]]

    def _handle_command_to_client__set_game_player_client_id(self, client_ids, command):
        if command[3] is None:
            self._remove_player_id_from_game(command[1], command[2])
        else:
            self._add_client_id_to_game(command[1], command[3])

    def _add_client_id_to_game(self, game_id, client_id):
        self._client_id_to_game_id[client_id] = game_id

        self._batch_game_id = game_id

    def _remove_client_id_from_game(self, client_id):
        if client_id in self._client_id_to_game_id:
            self._batch_game_id = self._client_id_to_game_id[client_id]

            del self._client_id_to_game_id[client_id]

    def _remove_player_id_from_game(self, game_id, player_id):
        client_id = self._username_to_client_id[self._game_id_to_game_log[game_id].player_id_to_username[player_id]]

        if client_id in self._client_id_to_game_id:
            self._batch_game_id = game_id

            del self._client_id_to_game_id[client_id]

    def _handle_command_to_server(self, client_id, command):
        try:
            handler = self._commands_to_server_handlers.get(command[0])
            if handler:
                handler(client_id, command)
        except:
            traceback.print_exc()

    def _handle_command_to_server__do_game_action(self, client_id, command):
        game_id = self._client_id_to_game_id.get(client_id)

        if game_id:
            game_log = self._game_id_to_game_log[game_id]
            player_id = game_log.username_to_player_id.get(self._client_id_to_username[client_id])

            if player_id is not None:
                self._batch_game_id = game_id

    def _handle_game_expired(self, game_id):
        self._batch_destroy_game_ids.append(game_id)

    def _handle_log(self, entry):
        game_id = entry['external-game-id'] if 'external-game-id' in entry else entry['game-id']
        internal_game_id = entry['game-id']

        if game_id in self._game_id_to_game_log:
            game_log = self._game_id_to_game_log[game_id]
        else:
            game_log = IndividualGameLog(self._log_timestamp, internal_game_id)
            self._game_id_to_game_log[game_id] = game_log

            for _, add_batch in self._client_id_to_add_batch.items():
                batch_line_number, batch = add_batch
                batch = [line for line in batch if not self._re_disconnect.match(line)]
                game_log.line_number_to_batch[batch_line_number] = batch

        if entry['_'] == 'game-player':
            player_id = entry['player-id']
            username = entry['username']

            game_log.player_id_to_username[player_id] = username
            game_log.username_to_player_id[username] = player_id

    def _handle_blank_line(self):
        if self._delayed_calls:
            for func, args in self._delayed_calls:
                func(*args)
            del self._delayed_calls[:]

        self._batch_completed(self._batch_line_number, self._batch)
        self._batch_line_number = self._line_number + 1
        self._batch = []

    def _batch_completed(self, batch_line_number, batch):
        if self._batch_add_client_id:
            for game_log in self._game_id_to_game_log.values():
                game_log.line_number_to_batch[batch_line_number] = batch

            self._client_id_to_add_batch[self._batch_add_client_id] = [batch_line_number, batch]
            self._batch_add_client_id = None

        if self._batch_remove_client_id:
            for game_log in self._game_id_to_game_log.values():
                game_log.line_number_to_batch[batch_line_number] = batch

            del self._client_id_to_add_batch[self._batch_remove_client_id]
            self._batch_remove_client_id = None

        if self._batch_game_id:
            game_log = self._game_id_to_game_log[self._batch_game_id]
            game_log.line_number_to_batch[batch_line_number] = batch

            self._batch_game_id = None

        if self._batch_destroy_game_ids:
            for game_id in self._batch_destroy_game_ids:
                self._completed_game_logs.append(self._game_id_to_game_log[game_id])
                del self._game_id_to_game_log[game_id]

            self._batch_destroy_game_ids = []


class IndividualGameLog:
    def __init__(self, log_timestamp, internal_game_id):
        self.log_timestamp = log_timestamp
        self.internal_game_id = internal_game_id

        self.player_id_to_username = {}
        self.username_to_player_id = {}

        self.line_number_to_batch = {}

    def make_game_log_file(self, filename):
        with open(filename, 'w') as f:
            for line_number, batch in sorted(self.line_number_to_batch.items()):
                f.write('--- batch line number: ' + str(line_number) + '\n')
                f.write('\n'.join(batch))
                f.write('\n')


def test_individual_game_log(output_dir):
    log_timestamp = 1432798259

    for log_timestamp, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            log_processor = LogProcessor(log_timestamp, file)
            for game in log_processor.go():
                print('stage1', game.internal_game_id)
                _test_individual_game_log__output_game_file(os.path.join(output_dir, '1'), game)

    log_timestamps_and_filenames = []
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            individual_game_log_maker = IndividualGameLogMaker(log_timestamp, file)
            for individual_game_log in individual_game_log_maker.go():
                print('stage2', individual_game_log.internal_game_id)
                filename = os.path.join(output_dir, '%d_%05d.txt' % (individual_game_log.log_timestamp, individual_game_log.internal_game_id))
                individual_game_log.make_game_log_file(filename)
                log_timestamps_and_filenames.append((log_timestamp, filename))

    for log_timestamp, filename in log_timestamps_and_filenames:
        with util.open_possibly_gzipped_file(filename) as file:
            log_processor = LogProcessor(log_timestamp, file)
            for game in log_processor.go():
                print('stage3', game.internal_game_id)
                _test_individual_game_log__output_game_file(os.path.join(output_dir, '2'), game)


def _test_individual_game_log__output_game_file(output_dir, game):
    with open(os.path.join(output_dir, '%d_%05d.json' % (game.log_timestamp, game.internal_game_id)), 'w') as f:
        for key, value in sorted(game.__dict__.items()):
            f.write(key)
            f.write(': ')
            if key == 'username_to_player_id':
                value = sorted(value.items())
            f.write(str(value))
            f.write('\n')


def output_sync_logs_for_all_unsynchronized_games(output_dir):
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=1408905413):
        print(filename)

        _generate_sync_logs(log_timestamp, filename, output_dir)


def report_on_sync_logs(output_dir):
    regex = re.compile(r'^(\d+)_0*(\d+)_0*(\d+)_sync_log.txt$')

    sync_logs_with_fully_unknown_tile_racks = []
    sync_logs_without_fully_unknown_tile_racks = []

    for filename in os.listdir(output_dir):
        match = regex.match(filename)
        if match:
            has_full_unknown_tile_rack = False
            with open(os.path.join(output_dir, filename), 'r') as f:
                for line in f:
                    if line == '[None, None, None, None, None, None]\n':
                        has_full_unknown_tile_rack = True

            data = (int(match.group(1)), int(match.group(2)), int(match.group(3)))
            if has_full_unknown_tile_rack:
                sync_logs_with_fully_unknown_tile_racks.append(data)
            else:
                sync_logs_without_fully_unknown_tile_racks.append(data)

    sync_logs_with_fully_unknown_tile_racks.sort(reverse=True)
    sync_logs_without_fully_unknown_tile_racks.sort(reverse=True)

    print('without fully unknown tile racks:')
    for log_timestamp, internal_game_id, num_tiles_on_board in sync_logs_without_fully_unknown_tile_racks:
        print(log_timestamp, internal_game_id, num_tiles_on_board)
    print()
    print('with fully unknown tile racks:')
    for log_timestamp, internal_game_id, num_tiles_on_board in sync_logs_with_fully_unknown_tile_racks:
        print(log_timestamp, internal_game_id, num_tiles_on_board)


def make_individual_game_logs_for_each_sync_log(input_dir, output_dir):
    regex = re.compile(r'^(\d+)_0*(\d+)_0*(\d+)_sync_log.txt$')

    log_timestamp_to_internal_game_ids = collections.defaultdict(set)
    for filename in os.listdir(input_dir):
        match = regex.match(filename)
        if match:
            log_timestamp_to_internal_game_ids[int(match.group(1))].add(int(match.group(2)))

    for log_timestamp, internal_game_ids in sorted(log_timestamp_to_internal_game_ids.items()):
        for _, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
            print(filename)
            with util.open_possibly_gzipped_file(filename) as file:
                individual_game_log_maker = IndividualGameLogMaker(log_timestamp, file)
                for individual_game_log in individual_game_log_maker.go():
                    if individual_game_log.internal_game_id in internal_game_ids:
                        filename = os.path.join(output_dir, '%d_%05d.txt' % (individual_game_log.log_timestamp, individual_game_log.internal_game_id))
                        individual_game_log.make_game_log_file(filename)
                        print(log_timestamp, individual_game_log.internal_game_id, filename)


def run_all_game_logs_with_tile_bag_tweaks(input_dir, output_dir):
    for log_timestamp, internal_game_id in sorted(Game.tile_bag_tweaks.keys()):
        filename = os.path.join(input_dir, '%d_%05d.txt' % (log_timestamp, internal_game_id))

        _generate_sync_logs(log_timestamp, filename, output_dir)


def verbosely_compare_individual_game_logs_with_tile_bag_tweaks(input_dir, output_dir):
    for log_timestamp, internal_game_id in sorted(Game.tile_bag_tweaks.keys()):
        filename = os.path.join(output_dir, '%d_%05d_verbose_comparison.txt' % (log_timestamp, internal_game_id))
        print(filename)
        with open(filename, 'w') as f:
            old_stdout = sys.stdout
            sys.stdout = f
            verbosely_compare_individual_game_log(log_timestamp, internal_game_id, input_dir, output_dir)
            sys.stdout = old_stdout


def verbosely_compare_individual_game_log(log_timestamp, internal_game_id, input_dir, output_dir):
    filename = os.path.join(input_dir, '%d_%05d.txt' % (log_timestamp, internal_game_id))

    with util.open_possibly_gzipped_file(filename) as file:
        log_processor = LogProcessor(log_timestamp, file, verbose=True, verbose_output_path=output_dir)

        for game in log_processor.go():
            game.make_server_game()
            game.compare_with_server_game()

            messages = [game.log_timestamp, game.internal_game_id]
            if game.is_server_game_synchronized:
                messages.append('yay!')
            else:
                messages.append('boo!')
                print('sync_log:')
                print('\n'.join(game.sync_log))

            print(*messages)


def _generate_sync_logs(log_timestamp, filename, output_dir):
    with util.open_possibly_gzipped_file(filename) as file:
        log_processor = LogProcessor(log_timestamp, file)

        for game in log_processor.go():
            game.make_server_game()
            game.compare_with_server_game()

            messages = [game.log_timestamp, game.internal_game_id]
            if game.is_server_game_synchronized:
                messages.append('yay!')
            else:
                messages.append('boo!')

                if game.sync_log is not None:
                    filename = os.path.join(output_dir, '%d_%05d_%03d_sync_log.txt' % (game.log_timestamp, game.internal_game_id, len(game.played_tiles_order)))
                    messages.append(filename)
                    with open(filename, 'w') as f:
                        f.write('\n'.join(game.sync_log))
                        f.write('\n')

            print(*messages)


def output_server_game_files_for_all_in_progress_games(output_dir):
    log_file_filenames = util.get_log_file_filenames('py', begin=1408905413)
    last_log_timestamp = log_file_filenames[-1][0]

    for log_timestamp, filename in log_file_filenames:
        is_most_recent_file = log_timestamp == last_log_timestamp

        with util.open_possibly_gzipped_file(filename) as file:
            log_processor = LogProcessor(log_timestamp, file)

            for game in log_processor.go():
                num_players = len(game.player_id_to_username)
                num_tiles_played = len(game.played_tiles_order)

                if game.state == 'InProgress' and num_players >= 2 and (not is_most_recent_file or game.expired):
                    game.make_server_game()
                    filename = os.path.join(output_dir, '%d_%05d_%03d.bin' % (game.log_timestamp, game.internal_game_id, num_tiles_played))
                    game.make_server_game_file(filename)

                    print(filename)


def output_first_merge_bonuses_and_final_scores_of_all_completed_games(output_dir):
    received_bonus_id = enums.GameHistoryMessages.ReceivedBonus.value

    mode_to_game_data = collections.defaultdict(list)

    for log_timestamp, filename in util.get_log_file_filenames('py', begin=1408905413):
        with util.open_possibly_gzipped_file(filename) as file:
            log_processor = LogProcessor(log_timestamp, file)

            for game in log_processor.go():
                num_players = len(game.player_id_to_username)

                if game.state == 'Completed' and num_players >= 2:
                    type_to_player_id_to_amount = collections.defaultdict(dict)

                    for game_history_message in game.username_to_game_history[game.player_id_to_username[0]]:
                        if game_history_message[0] == received_bonus_id:
                            type_to_player_id_to_amount[game_history_message[2]][game_history_message[1]] = game_history_message[3]
                        elif type_to_player_id_to_amount:
                            break

                    mode = game.mode + (str(num_players) if game.mode == 'Singles' else '')

                    mode_to_game_data[mode].append((dict(type_to_player_id_to_amount), game.score))

    with open(os.path.join(output_dir, 'first_merge_bonuses_and_final_scores_of_all_completed_games.bin'), 'wb') as f:
        pickle.dump(dict(mode_to_game_data), f)


def print_table(table):
    column_lengths = [max(map(len, column)) for column in zip(*table)]
    for row in table:
        print('  '.join((' ' * (column_length - len(cell))) + cell for cell, column_length in zip(row, column_lengths)))


def get_player_id_to_ranking(score):
    player_id_to_ranking = {}
    last_amount = None
    last_ranking = None
    for player_id, amount in sorted(enumerate(score), key=lambda x: -x[1]):
        if amount == last_amount:
            ranking = last_ranking
        else:
            ranking = len(player_id_to_ranking) + 1
        last_amount = amount
        last_ranking = ranking
        player_id_to_ranking[player_id] = ranking

    return player_id_to_ranking


def report_on_first_merge_bonuses_and_final_scores_of_all_completed_games(output_dir):
    with open(os.path.join(output_dir, 'first_merge_bonuses_and_final_scores_of_all_completed_games.bin'), 'rb') as f:
        mode_to_game_data = pickle.load(f)

    for mode, num_players in [('Singles2', 2), ('Singles3', 3), ('Singles4', 4), ('Teams', 4)]:
        game_data = mode_to_game_data[mode]

        bucket_to_ranking_to_count = collections.defaultdict(lambda: collections.defaultdict(int))
        bucket_to_not_applicable_count = collections.defaultdict(int)

        for type_to_player_id_to_amount, score in game_data:
            player_id_to_bucket = None
            if len(type_to_player_id_to_amount) == 1:
                player_id_to_amount = list(type_to_player_id_to_amount.values())[0]
                if len(player_id_to_amount) == 2:
                    sorted_player_id_and_amount = sorted(player_id_to_amount.items(), key=lambda x: -x[1])
                    if sorted_player_id_and_amount[0][1] != sorted_player_id_and_amount[1][1]:
                        player_id_to_bucket = {sorted_player_id_and_amount[0][0]: 0, sorted_player_id_and_amount[1][0]: 1}
                        for player_id in range(num_players):
                            if player_id not in player_id_to_bucket:
                                player_id_to_bucket[player_id] = 2

            if player_id_to_bucket:
                if mode == 'Teams':
                    score = [score[0] + score[2], score[1] + score[3]]

                player_id_to_ranking = get_player_id_to_ranking(score)

                for player_id, bucket in player_id_to_bucket.items():
                    if mode == 'Teams':
                        player_id %= 2
                    bucket_to_ranking_to_count[bucket][player_id_to_ranking[player_id]] += 1
            else:
                bucket_to_not_applicable_count[0] += 1
                bucket_to_not_applicable_count[1] += 1
                bucket_to_not_applicable_count[2] += num_players - 2

        table = [[str(ranking)] for ranking in sorted(bucket_to_ranking_to_count[0].keys())]
        table.append(['N/A'])

        for bucket in range(3):
            ranking_to_count = bucket_to_ranking_to_count[bucket]
            not_applicable_count = bucket_to_not_applicable_count[bucket]

            if ranking_to_count:
                sum_counts = sum(ranking_to_count.values())
                for ranking, count in sorted(ranking_to_count.items()):
                    table[ranking - 1].append('%d/%d' % (count, sum_counts))
                    table[ranking - 1].append('%.1f%%' % (count / sum_counts * 100, ))

                sum_counts += not_applicable_count
                table[-1].append('%d/%d' % (not_applicable_count, sum_counts))
                table[-1].append('%.1f%%' % (not_applicable_count / sum_counts * 100, ))

        print(mode)
        print_table(table)
        print()


def report_on_player_ranking_distribution(output_dir):
    with open(os.path.join(output_dir, 'first_merge_bonuses_and_final_scores_of_all_completed_games.bin'), 'rb') as f:
        mode_to_game_data = pickle.load(f)

    for mode in ['Singles2', 'Singles3', 'Singles4', 'Teams']:
        game_data = mode_to_game_data[mode]

        rankings_to_count = collections.defaultdict(int)

        for _, score in game_data:
            if mode == 'Teams':
                score = [score[0] + score[2], score[1] + score[3]]

            player_id_to_ranking = tuple(get_player_id_to_ranking(score).values())

            rankings_to_count[player_id_to_ranking] += 1

        print(mode)
        for rankings, count in sorted(rankings_to_count.items(), key=lambda x: -x[1]):
            print(rankings, count)
        print()


def make_individual_game_log(log_timestamp, internal_game_id, output_dir):
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            individual_game_log_maker = IndividualGameLogMaker(log_timestamp, file)
            for individual_game_log in individual_game_log_maker.go():
                if individual_game_log.internal_game_id == internal_game_id:
                    filename = os.path.join(output_dir, '%d_%05d.txt' % (individual_game_log.log_timestamp, individual_game_log.internal_game_id))
                    individual_game_log.make_game_log_file(filename)
                    print(log_timestamp, individual_game_log.internal_game_id, filename)
                    return


def output_server_game_file_for_game(log_timestamp, internal_game_id, output_dir):
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            log_processor = LogProcessor(log_timestamp, file)

            for game in log_processor.go():
                if game.internal_game_id == internal_game_id:
                    game.make_server_game()
                    num_tiles_played = len(game.played_tiles_order)
                    filename = os.path.join(output_dir, '%d_%05d_%03d.bin' % (log_timestamp, internal_game_id, num_tiles_played))
                    game.make_server_game_file(filename)
                    break


game_board_type_to_character = {
    enums.GameBoardTypes.Luxor.value: 'L',
    enums.GameBoardTypes.Tower.value: 'T',
    enums.GameBoardTypes.American.value: 'A',
    enums.GameBoardTypes.Festival.value: 'F',
    enums.GameBoardTypes.Worldwide.value: 'W',
    enums.GameBoardTypes.Continental.value: 'C',
    enums.GameBoardTypes.Imperial.value: 'I',
    enums.GameBoardTypes.Nothing.value: '·',
    enums.GameBoardTypes.NothingYet.value: 'O',
    enums.GameBoardTypes.CantPlayEver.value: '█',
    enums.GameBoardTypes.IHaveThis.value: 'i',
    enums.GameBoardTypes.WillPutLonelyTileDown.value: 'l',
    enums.GameBoardTypes.HaveNeighboringTileToo.value: 'h',
    enums.GameBoardTypes.WillFormNewChain.value: 'n',
    enums.GameBoardTypes.WillMergeChains.value: 'm',
    enums.GameBoardTypes.CantPlayNow.value: 'c',
}
score_board_column_widths = [1, 2, 2, 2, 2, 2, 2, 2, 4, 4]
game_board_string_spacer = '            '


def make_acquire2_game_test_files(log_timestamp, output_dir):
    for _, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            os.makedirs(os.path.join(output_dir, str(log_timestamp)), exist_ok=True)

            log_processor = LogProcessor(log_timestamp, file)

            for game in log_processor.go():
                filename = os.path.join(output_dir, '%d/%05d_%03d.txt' % (game.log_timestamp, game.internal_game_id, len(game.played_tiles_order)))

                lines = []

                tile_bag = game._get_initial_tile_bag()
                lines.append('tile bag: ' + ', '.join(to_tile_string(t) for t in tile_bag[::-1]))
                host_username = game.player_join_order[0]
                host_user_id = 0
                for username in game.player_id_to_username.values():
                    username = get_actual_username(log_timestamp, username)
                    user_id = username_to_user_id[username]
                    lines.append('user: ' + str(user_id) + ' ' + username)
                    if username == host_username:
                        host_user_id = user_id
                lines.append('host: ' + str(host_user_id))

                server_game = server.Game(game.game_id, game.internal_game_id, enums.GameModes[game.mode].value, game.max_players, Game._add_pending_messages, False, tile_bag)

                server_game_player_id_to_client = [Client(player_id, username) for player_id, username in sorted(game.player_id_to_username.items())]

                for username in game.player_join_order:
                    client = server_game_player_id_to_client[game.username_to_player_id[username]]
                    server_game.join_game(client)

                last_history_message_index = 0

                for _, player_id_and_action_and_timestamp in enumerate(game.actions):
                    player_id, action, timestamp = player_id_and_action_and_timestamp

                    game_action_id = action[0]
                    game_action = enums.GameActions(game_action_id)
                    data = action[1:]

                    try:
                        acquire2_parameter_strings = to_parameter_strings(server_game, player_id, game_action, data)
                    except:
                        continue

                    num_history_messages = len(server_game.history_messages)

                    try:
                        server_game.do_game_action(server_game_player_id_to_client[player_id], game_action_id, data)
                        server_game.score_sheet.update_net_worths()
                    except:
                        pass

                    if len(server_game.history_messages) > num_history_messages:
                        next_action = server_game.actions[-1]

                        lines.append('')

                        if timestamp is not None:
                            lines.append('timestamp: ' + str(math.floor(timestamp * 1000)))

                        acquire2_parameters = ' ' + ' '.join(acquire2_parameter_strings) if len(acquire2_parameter_strings) > 0 else ''
                        lines.append('action: ' + str(player_id) + ' ' + game_action.name + acquire2_parameters)

                        game_board_lines = get_game_board_lines(server_game.game_board)
                        turn_player_id = server_game.turn_player_id
                        move_player_id = None if type(next_action) is server.ActionGameOver else next_action.player_id
                        score_board_lines = get_score_board_lines(server_game.score_sheet, turn_player_id, move_player_id)
                        for line in get_game_board_lines_next_to_score_board_lines(game_board_lines, score_board_lines):
                            lines.append('  ' + line)

                        lines.append('  tile racks:')
                        for player_id, tile_rack in enumerate(server_game.tile_racks.racks):
                            lines.append('    ' + str(player_id) + ': ' + get_tile_rack_string(tile_rack))

                        lines.append('  history messages:')
                        for history_message in server_game.history_messages[last_history_message_index:]:
                            lines.append('    ' + get_game_history_message_string(server_game.score_sheet.username_to_player_id, history_message[1]))

                        lines.append('  next action: ' + get_next_action_string(next_action))

                        last_history_message_index = len(server_game.history_messages)

                lines.append('')

                with open(filename, 'w') as f:
                    f.write('\n'.join(lines))


def to_parameter_strings(server_game, player_id, game_action, parameters):
    strings = []

    if game_action == enums.GameActions.PlayTile:
        strings.append(to_tile_string(server_game.tile_racks.racks[player_id][parameters[0]][0]))
    elif game_action == enums.GameActions.SelectNewChain or game_action == enums.GameActions.SelectMergerSurvivor or game_action == enums.GameActions.SelectChainToDisposeOfNext:
        strings.append(enums.GameBoardTypes(parameters[0]).name[0])
    elif game_action == enums.GameActions.DisposeOfShares:
        strings.extend(str(x) for x in parameters)
    elif game_action == enums.GameActions.PurchaseShares:
        if len(parameters[0]) == 0:
            strings.append('x')
        else:
            strings.append(','.join(enums.GameBoardTypes(x).name[0] for x in parameters[0]))
        strings.append(str(parameters[1]))

    return strings


def to_tile_string(coordinates):
    return str(coordinates[0] + 1) + string.ascii_uppercase[coordinates[1]]


def to_tile_int(coordinates):
    return coordinates[0] * 9 + coordinates[1]


def get_game_board_lines(game_board):
    lines = []

    for y in range(9):
        lines.append(''.join(game_board_type_to_character[game_board.x_to_y_to_board_type[x][y]] for x in range(12)))

    return lines


def get_score_board_lines(score_board, turn_player_id, move_player_id):
    lines = []

    lines.append(format_score_board_line(['P', 'L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']))
    for player_id, line in enumerate(score_board.player_data):
        if player_id == turn_player_id:
            name = 'T'
        elif player_id == move_player_id:
            name = 'M'
        else:
            name = ''
        lines.append(format_score_board_line([name, *[str(x) if i >= 7 or x > 0 else '' for i, x in enumerate(line[:9])]]))
    lines.append(format_score_board_line(['A', *[str(x) for x in score_board.available]]))
    lines.append(format_score_board_line(['C', *[str(x) if x > 0 else '-' for x in score_board.chain_size]]))
    lines.append(format_score_board_line(['P', *[str(x) if x > 0 else '-' for x in score_board.price]]))

    return lines


def format_score_board_line(entries):
    line_parts = []

    for index, entry in enumerate(entries):
        num_spaces_to_add = score_board_column_widths[index] - len(entry)
        if num_spaces_to_add:
            entry = ' ' * num_spaces_to_add + entry
        line_parts.append(entry)

    return ' '.join(line_parts)


def get_game_board_lines_next_to_score_board_lines(game_board_lines, score_board_lines):
    lines = []

    for i in range(max(len(game_board_lines), len(score_board_lines))):
        line_parts = []
        line_parts.append(game_board_lines[i] if i < len(game_board_lines) else game_board_string_spacer)
        if i < len(score_board_lines):
            line_parts.append('  ')
            line_parts.append(score_board_lines[i])
        lines.append(''.join(line_parts))

    return lines


def get_tile_rack_string(tiles):
    return ' '.join(to_tile_string(tile[0]) + '(' + game_board_type_to_character[tile[1]] + ')' if tile else 'none' for tile in tiles)


def get_next_action_string(action):
    parts = [str(action.player_id), enums.GameActions(action.game_action_id).name]

    action_type = type(action)
    if action_type == server.ActionSelectNewChain or action_type == server.ActionSelectMergerSurvivor or action_type == server.ActionSelectChainToDisposeOfNext:
        parts.append(','.join(map(lambda p: enums.GameBoardTypes(p).name[0], action.additional_params[0])))
    elif action_type == server.ActionDisposeOfShares:
        parts.append(enums.GameBoardTypes(action.additional_params[0]).name[0])

    return ' '.join(parts)


def ghmsh(parameters):
    return enums.GameHistoryMessages(parameters[0]).name


def ghmsh_player_id(parameters):
    return ' '.join([
        str(parameters[1]),
        enums.GameHistoryMessages(parameters[0]).name,
    ])


def ghmsh_player_id_tile(parameters):
    return ' '.join([
        str(parameters[1]),
        enums.GameHistoryMessages(parameters[0]).name,
        to_tile_string(parameters[2:4]),
    ])


def ghmsh_player_id_type(parameters):
    return ' '.join([
        str(parameters[1]),
        enums.GameHistoryMessages(parameters[0]).name,
        enums.GameBoardTypes(parameters[2]).name[0],
        *[str(p) for p in parameters[3:]],
    ])


def ghmsh_merged_chains(parameters):
    return ' '.join([
        str(parameters[1]),
        enums.GameHistoryMessages(parameters[0]).name,
        ','.join([enums.GameBoardTypes(t).name[0] for t in parameters[2]]),
    ])


def ghmsh_purchased_shares(parameters):
    return ' '.join([
        str(parameters[1]),
        enums.GameHistoryMessages(parameters[0]).name,
        ','.join(str(p[1]) + enums.GameBoardTypes(p[0]).name[0] for p in parameters[2]) if len(parameters[2]) > 0 else 'x',
    ])


game_history_message_string_handlers = {
    enums.GameHistoryMessages.TurnBegan.value: ghmsh_player_id,
    enums.GameHistoryMessages.DrewPositionTile.value: ghmsh_player_id_tile,
    enums.GameHistoryMessages.StartedGame.value: ghmsh_player_id,
    enums.GameHistoryMessages.DrewTile.value: ghmsh_player_id_tile,
    enums.GameHistoryMessages.HasNoPlayableTile.value: ghmsh_player_id,
    enums.GameHistoryMessages.PlayedTile.value: ghmsh_player_id_tile,
    enums.GameHistoryMessages.FormedChain.value: ghmsh_player_id_type,
    enums.GameHistoryMessages.MergedChains.value: ghmsh_merged_chains,
    enums.GameHistoryMessages.SelectedMergerSurvivor.value: ghmsh_player_id_type,
    enums.GameHistoryMessages.SelectedChainToDisposeOfNext.value: ghmsh_player_id_type,
    enums.GameHistoryMessages.ReceivedBonus.value: ghmsh_player_id_type,
    enums.GameHistoryMessages.DisposedOfShares.value: ghmsh_player_id_type,
    enums.GameHistoryMessages.CouldNotAffordAnyShares.value: ghmsh_player_id,
    enums.GameHistoryMessages.PurchasedShares.value: ghmsh_purchased_shares,
    enums.GameHistoryMessages.DrewLastTile.value: ghmsh_player_id,
    enums.GameHistoryMessages.ReplacedDeadTile.value: ghmsh_player_id_tile,
    enums.GameHistoryMessages.EndedGame.value: ghmsh_player_id,
    enums.GameHistoryMessages.NoTilesPlayedForEntireRound.value: ghmsh,
    enums.GameHistoryMessages.AllTilesPlayed.value: ghmsh,
}


def get_game_history_message_string(username_to_player_id, game_history_message):
    if isinstance(game_history_message[1], str):
        game_history_message = list(game_history_message)
        game_history_message[1] = username_to_player_id[game_history_message[1]]

    return game_history_message_string_handlers[game_history_message[0]](game_history_message)


class ChatMessageProcessor:
    def __init__(self, log_timestamp, file):
        self._client_id_to_username = {}
        self._client_id_to_game_id = {}

        self._log_parser = LogParser(log_timestamp, file)

        self._line_type_to_handler = {
            LineTypes.time: self._handle_time,
            LineTypes.connect: self._handle_connect,
            LineTypes.command_to_client: self._handle_command_to_client,
        }

        self._commands_to_client_handlers = {
            enums.CommandsToClient.SetGamePlayerJoin.value: self._handle_command_to_client__set_game_player_join,
            enums.CommandsToClient.SetGamePlayerRejoin.value: self._handle_command_to_client__set_game_player_rejoin,
            enums.CommandsToClient.SetGameWatcherClientId.value: self._handle_command_to_client__set_game_watcher_client_id,
            Enums.lookups['CommandsToClient'].index('SetGamePlayerClientId'): self._handle_command_to_client__set_game_player_client_id,
            enums.CommandsToClient.AddGlobalChatMessage.value: self._handle_command_to_client__add_global_chat_message,
            enums.CommandsToClient.AddGameChatMessage.value: self._handle_command_to_client__add_game_chat_message,
        }

        self._time = None

    def go(self):
        for line_type, _, _, parse_line_data in self._log_parser.go():
            handler = self._line_type_to_handler.get(line_type)
            if handler:
                handler(*parse_line_data)

    def _handle_time(self, time):
        self._time = time

    def _handle_connect(self, client_id, username):
        self._client_id_to_username[client_id] = username

    def _handle_command_to_client(self, client_ids, commands):
        for command in commands:
            try:
                handler = self._commands_to_client_handlers.get(command[0])
                if handler:
                    handler(client_ids, command)
            except:
                traceback.print_exc()

    def _handle_command_to_client__set_game_player_join(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_player_rejoin(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[3])

    def _handle_command_to_client__set_game_watcher_client_id(self, client_ids, command):
        self._add_client_id_to_game(command[1], command[2])

    def _handle_command_to_client__set_game_player_client_id(self, client_ids, command):
        if command[3] is not None:
            self._add_client_id_to_game(command[1], command[3])

    def _add_client_id_to_game(self, game_id, client_id):
        self._client_id_to_game_id[client_id] = game_id

    def _handle_command_to_client__add_global_chat_message(self, client_ids, command):
        client_id = command[1]
        username = self._client_id_to_username[client_id]
        chat_message = command[2]
        print(self._time, 'GLOBAL', username, '->', chat_message)

    def _handle_command_to_client__add_game_chat_message(self, client_ids, command):
        client_id = command[1]
        username = self._client_id_to_username[client_id]
        game_id = self._client_id_to_game_id[client_id]
        chat_message = command[2]
        print(self._time, 'GAME#' + str(game_id), username, '->', chat_message)


def output_chat_messages(log_timestamp):
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
        with util.open_possibly_gzipped_file(filename) as file:
            chat_message_processor = ChatMessageProcessor(log_timestamp, file)
            chat_message_processor.go()


def compare_log_usernames_with_database_usernames(log_timestamp):
    query_for_game_players = sqlalchemy.sql.text('''
        select game_player.player_index as player_id, user.name as username
        from game
        join game_player on game_player.game_id = game.game_id
        join user on user.user_id = game_player.user_id
        where game.log_time = :log_timestamp and game.number = :internal_game_id
        order by game_player.player_index
    ''')

    with orm.session_scope() as session:
        for _, filename in util.get_log_file_filenames('py', begin=log_timestamp, end=log_timestamp):
            with util.open_possibly_gzipped_file(filename) as file:
                log_processor = LogProcessor(log_timestamp, file)
                for game in log_processor.go():
                    print('--', log_timestamp, game.internal_game_id)
                    for row in session.execute(query_for_game_players, {'log_timestamp': log_timestamp, 'internal_game_id': game.internal_game_id}):
                        log_username = game.player_id_to_username[row.player_id]
                        database_username = row.username.decode('utf-8')

                        if log_username != database_username:
                            print(ujson.encode([log_timestamp, game.internal_game_id, log_username, database_username]))


def output_command_to_run_this_script_in_parallel_on_all_logs():
    log_file_data = []
    for log_timestamp, filename in util.get_log_file_filenames('py', begin=1408905413):
        file_size = os.stat(filename).st_size
        if not filename.endswith('.gz'):
            # approximate what the gzipped size would be based on recent log file compression ratios
            file_size = file_size * 0.1765
        log_file_data.append((file_size, log_timestamp))

    log_file_data.sort(reverse=True)

    print('echo ' + ' '.join([str(d[1]) for d in log_file_data]) + ' | xargs -n 1 -P 4 python3 -u -OO logs_to_games.py')


def output_username_to_user_id():
    usernames_set = set()
    next_user_id = 1

    print('username_to_user_id = {')

    for log_timestamp, filename in util.get_log_file_filenames('py', begin=1408905413):
        print('    # log_timestamp:', log_timestamp)
        with util.open_possibly_gzipped_file(filename) as file:
            log_parser = LogParser(log_timestamp, file)
            for line_type, _, _, parse_line_data in log_parser.go():
                if line_type == LineTypes.connect:
                    _, username = parse_line_data
                    username = log_timestamp_and_username_to_correct_username.get((log_timestamp, username), username)
                    original_username = username
                    if not is_ascii(username):
                        username = username.encode('punycode').decode().strip()
                    if username not in usernames_set:
                        usernames_set.add(username)
                        print('    ' + repr(username) + ': ' + str(next_user_id) + ',' + (' # original non-ascii: ' + original_username if username != original_username else ''))
                        next_user_id += 1

    print('}')


def is_ascii(string):
    return all(32 <= ord(c) <= 126 for c in string)


log_timestamp_and_username_to_correct_username = {
    # requested name changes
    (1418805302, 'Temp'): 'Mr Brain',
    (1511554298, 'ranger'): 'Ranger',
    (1514744670, 'Alias18'): 'Alias2018',
}


def get_actual_username(log_timestamp, username):
    username = log_timestamp_and_username_to_correct_username.get((log_timestamp, username), username)
    if not is_ascii(username):
        username = username.encode('punycode').decode().strip()
    return username


def output_non_ascii_usernames_in_the_database():
    query_for_user_names = sqlalchemy.sql.text('''
        select user_id, name
        from user
    ''')

    with orm.session_scope() as session:
        for row in session.execute(query_for_user_names):
            user_id = row.user_id
            username = row.name.decode()
            if not is_ascii(username):
                print(user_id, repr(username))


def main():
    output_dir = '/home/tim/tmp/acquire'
    output_logs_dir = output_dir + '/logs'

    # test_individual_game_log(output_dir)

    # output_sync_logs_for_all_unsynchronized_games(output_logs_dir)
    # report_on_sync_logs(output_logs_dir)
    # make_individual_game_logs_for_each_sync_log(output_logs_dir, output_logs_dir)
    # run_all_game_logs_with_tile_bag_tweaks(output_logs_dir, output_dir)
    # verbosely_compare_individual_game_logs_with_tile_bag_tweaks(output_logs_dir, output_dir)
    # output_server_game_files_for_all_in_progress_games(output_dir)
    # output_first_merge_bonuses_and_final_scores_of_all_completed_games(output_dir)
    # report_on_first_merge_bonuses_and_final_scores_of_all_completed_games(output_dir)
    # report_on_player_ranking_distribution(output_dir)
    # make_individual_game_log(1483363628, 893, output_dir)
    # output_server_game_file_for_game(1433241253, 510, output_dir)
    # make_acquire2_game_test_files(1408905413, output_dir)
    # output_chat_messages(1520848828)
    # compare_log_usernames_with_database_usernames(1408911415)
    # output_command_to_run_this_script_in_parallel_on_all_logs()
    # output_username_to_user_id()
    # output_non_ascii_usernames_in_the_database()


if __name__ == '__main__':
    main()
