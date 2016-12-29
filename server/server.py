#!/usr/bin/env python3

import asyncio
import collections
import enums
import heapq
import json
import math
import random
import re
import time
import traceback
import ujson


class ServerProtocol(asyncio.Protocol):
    def __init__(self, server):
        self.server = server
        self.transport = None
        self.unprocessed_data = []

    def connection_made(self, transport):
        self.transport = transport
        self.server.transport_write = transport.write
        print('time:', time.time())
        print('connection_made')
        print()

    def connection_lost(self, exc):
        print('time:', time.time())
        print('connection_lost')
        print()

    def data_received(self, data):
        start_index = 0
        len_data = len(data)
        while start_index < len_data:
            index = data.find(b'\n', start_index)
            if index >= 0:
                key_and_value = data[start_index:index]
                start_index = index + 1

                if self.unprocessed_data:
                    key_and_value = b''.join(self.unprocessed_data) + key_and_value
                    del self.unprocessed_data[:]

                key, value = key_and_value.split(b' ', 1)
                if key == b'connect':
                    value = ujson.decode(value.decode())
                    Client(self.server, *value)
                elif key == b'disconnect':
                    client = self.server.client_id_to_client.get(int(value.decode()), None)
                    if client:
                        client.disconnect()
                else:
                    client = self.server.client_id_to_client.get(int(key.decode()), None)
                    if client:
                        client.on_message(value)
            else:
                self.unprocessed_data.append(data[start_index:])
                break


class ReuseIdManager:
    def __init__(self, return_wait):
        self.return_wait = return_wait
        self._used = set()
        self._unused = []
        self._unused_wait = []

    def get_id(self):
        current_time = time.time()
        while len(self._unused_wait) and self._unused_wait[0][0] <= current_time:
            heapq.heappush(self._unused, heapq.heappop(self._unused_wait)[1])

        if len(self._unused):
            next_id = heapq.heappop(self._unused)
        else:
            next_id = len(self._used) + len(self._unused_wait) + 1
        self._used.add(next_id)
        return next_id

    def return_id(self, returned_id):
        self._used.remove(returned_id)
        heapq.heappush(self._unused_wait, (time.time() + self.return_wait, returned_id))


class IncrementIdManager:
    def __init__(self):
        self._last_id = 0

    def get_id(self):
        self._last_id += 1
        return self._last_id

    def return_id(self, returned_id):
        pass


class Server:
    re_camelcase = re.compile(r'(.)([A-Z])')

    def __init__(self):
        self.next_client_id_manager = ReuseIdManager(60)
        self.client_id_to_client = {}
        self.client_ids = set()
        self.username_to_client = {}
        self.next_game_id_manager = ReuseIdManager(60)
        self.next_internal_game_id_manager = IncrementIdManager()
        self.game_id_to_game = {}
        self.client_ids_and_messages = []

        self.transport_write = None

    def add_pending_messages(self, messages, client_ids=None):
        if client_ids is None:
            client_ids = self.client_ids
        client_ids = client_ids.copy()
        new_list = []
        for client_ids2, messages2 in self.client_ids_and_messages:
            client_ids_in_group = client_ids2 & client_ids
            if len(client_ids_in_group) == len(client_ids2):
                messages2.extend(messages)
                new_list.append([client_ids2, messages2])
            elif client_ids_in_group:
                new_list.append([client_ids_in_group, messages2 + messages])
                client_ids2 -= client_ids_in_group
                new_list.append([client_ids2, messages2])
            else:
                new_list.append([client_ids2, messages2])
            client_ids -= client_ids_in_group
        if client_ids:
            new_list.append([client_ids, messages])
        self.client_ids_and_messages = new_list

    def flush_pending_messages(self):
        outgoing = []
        for client_ids, messages in self.client_ids_and_messages:
            client_ids_string = ','.join(str(x) for x in sorted(client_ids))
            messages_json = ujson.dumps(messages)
            print(client_ids_string, '<-', messages_json)

            outgoing.append(client_ids_string.encode())
            outgoing.append(b' ')
            outgoing.append(messages_json.encode())
            outgoing.append(b'\n')

        del self.client_ids_and_messages[:]
        print()

        self.transport_write(b''.join(outgoing))

    def destroy_expired_games(self):
        current_time = time.time()
        expired_games = []

        for game in self.game_id_to_game.values():
            if game.expiration_time and game.expiration_time <= current_time:
                expired_games.append(game)

        if expired_games:
            messages = []
            print('time:', current_time)
            for game in expired_games:
                game_id = game.game_id
                internal_game_id = game.internal_game_id
                print('game #%d expired (internal #%d)' % (game_id, internal_game_id))
                self.next_game_id_manager.return_id(game_id)
                self.next_internal_game_id_manager.return_id(internal_game_id)
                del self.game_id_to_game[game_id]
                messages.append([enums.CommandsToClient.DestroyGame.value, game_id])
            self.add_pending_messages(messages)
            self.flush_pending_messages()


class Client:
    def __init__(self, server, username, ip_address, socket_id, replace_existing_user):
        self._server = server
        self.username = username
        self.ip_address = ip_address
        self.client_id = self._server.next_client_id_manager.get_id()
        self._logged_in = False
        self.game_id = None
        self.player_id = None

        self._server.client_id_to_client[self.client_id] = self
        messages_client = []

        def output_connect_messages():
            print('time:', time.time())
            print(self.client_id, 'connect', self.username, self.ip_address, socket_id, replace_existing_user)
            self._server.transport_write(b'connect ' + ujson.dumps([socket_id, self.client_id]).encode() + b'\n')

        if self.username in self._server.username_to_client:
            if replace_existing_user:
                self._server.username_to_client[self.username].disconnect()
            else:
                output_connect_messages()
                messages_client.append([enums.CommandsToClient.FatalError.value, enums.Errors.UsernameAlreadyInUse.value])
                self._server.add_pending_messages(messages_client, {self.client_id})
                self._server.flush_pending_messages()
                self.disconnect()
                return

        output_connect_messages()

        self._server.client_ids.add(self.client_id)

        self._logged_in = True
        self.on_message_lookup = []
        for command_enum in enums.CommandsToServer:
            self.on_message_lookup.append(getattr(self, '_on_message_' + self._server.re_camelcase.sub(r'\1_\2', command_enum.name).lower()))
        self._server.username_to_client[self.username] = self

        messages_client.append([enums.CommandsToClient.SetClientId.value, self.client_id])

        # tell client about other clients' data
        for client in self._server.client_id_to_client.values():
            if client is not self:
                messages_client.append([enums.CommandsToClient.SetClientIdToData.value, client.client_id, client.username, client.ip_address])
        self._server.add_pending_messages(messages_client, {self.client_id})
        messages_client = []

        # tell all clients about client's data
        self._server.add_pending_messages([[enums.CommandsToClient.SetClientIdToData.value, self.client_id, self.username, self.ip_address]])

        # tell client about all games
        for game in sorted(self._server.game_id_to_game.values(), key=lambda x: x.internal_game_id):
            game_id = game.game_id
            messages_client.append([enums.CommandsToClient.SetGameState.value, game_id, game.state, game.mode, game.max_players])
            for player_id, player_datum in enumerate(game.score_sheet.player_data):
                if player_datum[enums.ScoreSheetIndexes.Client.value]:
                    messages_client.append([enums.CommandsToClient.SetGamePlayerJoin.value, game_id, player_id, player_datum[enums.ScoreSheetIndexes.Client.value].client_id])
                else:
                    username = player_datum[enums.ScoreSheetIndexes.Username.value]
                    client = self._server.username_to_client.get(username)
                    messages_client.append([enums.CommandsToClient.SetGamePlayerJoinMissing.value, game_id, player_id, client.client_id if client else username])
            for client_id in game.watcher_client_ids:
                messages_client.append([enums.CommandsToClient.SetGameWatcherClientId.value, game_id, client_id])
        self._server.add_pending_messages(messages_client, {self.client_id})

        self._server.flush_pending_messages()

    def disconnect(self):
        print('time:', time.time())
        print(self.client_id, 'disconnect')

        self._server.transport_write(b'disconnect ' + str(self.client_id).encode() + b'\n')

        del self._server.client_id_to_client[self.client_id]
        self._server.client_ids.discard(self.client_id)
        self._server.next_client_id_manager.return_id(self.client_id)

        if self.game_id:
            self._server.game_id_to_game[self.game_id].leave_game(self)

        if self._logged_in:
            del self._server.username_to_client[self.username]
            self._server.add_pending_messages([[enums.CommandsToClient.SetClientIdToData.value, self.client_id, None, None]])
            self._server.flush_pending_messages()
        else:
            print()

    def on_message(self, payload):
        try:
            message = payload.decode()
            print('time:', time.time())
            print(self.client_id, '->', message)
            message = ujson.decode(message)
            method = self.on_message_lookup[message[0]]
            arguments = message[1:]
        except:
            traceback.print_exc()
            self.disconnect()
            return

        try:
            method(*arguments)
            self._server.flush_pending_messages()
        except TypeError:
            traceback.print_exc()
            self.disconnect()

    def _on_message_create_game(self, mode, max_players):
        if not self.game_id and isinstance(mode, int) and 0 <= mode < enums.GameModes.Max.value and isinstance(max_players, int) and 1 <= max_players <= 6:
            game_id = self._server.next_game_id_manager.get_id()
            internal_game_id = self._server.next_internal_game_id_manager.get_id()
            game = Game(game_id, internal_game_id, mode, max_players, self._server.add_pending_messages)
            game.join_game(self)
            self._server.game_id_to_game[game_id] = game

    def _on_message_join_game(self, game_id):
        if not self.game_id and game_id in self._server.game_id_to_game:
            self._server.game_id_to_game[game_id].join_game(self)

    def _on_message_rejoin_game(self, game_id):
        if not self.game_id and game_id in self._server.game_id_to_game:
            self._server.game_id_to_game[game_id].rejoin_game(self)

    def _on_message_watch_game(self, game_id):
        if not self.game_id and game_id in self._server.game_id_to_game:
            self._server.game_id_to_game[game_id].watch_game(self)

    def _on_message_leave_game(self):
        if self.game_id:
            self._server.game_id_to_game[self.game_id].leave_game(self)

    def _on_message_do_game_action(self, game_action_id, *data):
        if self.game_id:
            self._server.game_id_to_game[self.game_id].do_game_action(self, game_action_id, data)

    def _on_message_send_global_chat_message(self, chat_message):
        chat_message = ' '.join(chat_message.split())
        if chat_message:
            self._server.add_pending_messages([[enums.CommandsToClient.AddGlobalChatMessage.value, self.client_id, chat_message]])

    def _on_message_send_game_chat_message(self, chat_message):
        if self.game_id:
            chat_message = ' '.join(chat_message.split())
            if chat_message:
                self._server.add_pending_messages([[enums.CommandsToClient.AddGameChatMessage.value, self.client_id, chat_message]], self._server.game_id_to_game[self.game_id].client_ids)


class GameBoard:
    def __init__(self, game, board=None):
        self.game = game

        if board is None:
            board = [[enums.GameBoardTypes.Nothing.value for y in range(9)] for x in range(12)]
        self.x_to_y_to_board_type = board

        self.board_type_to_coordinates = [set() for t in range(enums.GameBoardTypes.Max.value)]
        for x in range(12):
            for y in range(9):
                self.board_type_to_coordinates[board[x][y]].add((x, y))

    def _set_cell(self, coordinates, board_type):
        x, y = coordinates
        old_board_type = self.x_to_y_to_board_type[x][y]
        self.board_type_to_coordinates[old_board_type].remove(coordinates)
        self.x_to_y_to_board_type[x][y] = board_type
        self.board_type_to_coordinates[board_type].add(coordinates)
        return [enums.CommandsToClient.SetGameBoardCell.value, x, y, board_type]

    def set_cell(self, coordinates, board_type):
        self.game.add_pending_messages([self._set_cell(coordinates, board_type)], self.game.client_ids)

    def fill_cells(self, coordinates, board_type):
        pending = [coordinates]
        found = {coordinates}
        messages = []
        excluded_board_types = {enums.GameBoardTypes.Nothing.value, enums.GameBoardTypes.CantPlayEver.value, board_type}

        while pending:
            new_pending = []
            for coords in pending:
                messages.append(self._set_cell(coords, board_type))

                x, y = coords
                possibilities = []
                if x:
                    possibilities.append((x - 1, y))
                if x < 11:
                    possibilities.append((x + 1, y))
                if y:
                    possibilities.append((x, y - 1))
                if y < 8:
                    possibilities.append((x, y + 1))

                for coords2 in possibilities:
                    if coords2 not in found and self.x_to_y_to_board_type[coords2[0]][coords2[1]] not in excluded_board_types:
                        new_pending.append(coords2)
                        found.add(coords2)

            pending = new_pending

        self.game.add_pending_messages(messages, self.game.client_ids)


class ScoreSheet:
    def __init__(self, game):
        self.game = game

        self.player_data = []
        self.available = [25, 25, 25, 25, 25, 25, 25]
        self.chain_size = [0, 0, 0, 0, 0, 0, 0]
        self.price = [0, 0, 0, 0, 0, 0, 0]

        self.creator_username = None
        self.username_to_player_id = {}

    def join_game(self, client, position_tile):
        messages_client = []

        if not self.player_data:
            self.creator_username = client.username
        self.player_data.append([0, 0, 0, 0, 0, 0, 0, 60, 60, client.username, position_tile, client])
        self.player_data.sort(key=lambda t: t[enums.ScoreSheetIndexes.PositionTile.value])

        # update player_ids for all clients in game
        player_id = 0
        for player_datum in self.player_data:
            if player_datum[enums.ScoreSheetIndexes.Client.value]:
                player_datum[enums.ScoreSheetIndexes.Client.value].player_id = player_id
            player_id += 1

        for player_id, player_datum in enumerate(self.player_data):
            # update self.username_to_player_id
            if player_id >= client.player_id:
                username = player_datum[enums.ScoreSheetIndexes.Username.value]
                self.username_to_player_id[username] = player_id
                if self.game.logging_enabled:
                    log = collections.OrderedDict()
                    log['_'] = 'game-player'
                    log['game-id'] = self.game.internal_game_id
                    log['external-game-id'] = self.game.game_id
                    log['player-id'] = player_id
                    log['username'] = username
                    print(json.dumps(log, separators=(',', ':')))

            # tell client about other position tiles
            if player_id != client.player_id:
                x, y = player_datum[enums.ScoreSheetIndexes.PositionTile.value]
                messages_client.append([enums.CommandsToClient.SetGameBoardCell.value, x, y, enums.GameBoardTypes.NothingYet.value])

        self.game.add_pending_messages([[enums.CommandsToClient.SetGamePlayerJoin.value, self.game.game_id, client.player_id, client.client_id]])
        if messages_client:
            self.game.add_pending_messages(messages_client, {client.client_id})

    def rejoin_game(self, client):
        player_id = self.username_to_player_id[client.username]
        client.player_id = player_id
        self.player_data[player_id][enums.ScoreSheetIndexes.Client.value] = client
        self.game.add_pending_messages([[enums.CommandsToClient.SetGamePlayerRejoin.value, self.game.game_id, player_id, client.client_id]])

    def leave_game(self, client):
        player_id = client.player_id
        client.player_id = None
        self.player_data[player_id][enums.ScoreSheetIndexes.Client.value] = None
        self.game.add_pending_messages([[enums.CommandsToClient.SetGamePlayerLeave.value, self.game.game_id, player_id, client.client_id]])

    def is_username_in_game(self, username):
        return username in self.username_to_player_id

    def get_creator_player_id(self):
        return self.username_to_player_id[self.creator_username] if self.creator_username else None

    def adjust_player_data(self, player_id, score_sheet_index, adjustment):
        self.player_data[player_id][score_sheet_index] += adjustment

        if score_sheet_index <= enums.ScoreSheetIndexes.Imperial.value:
            self.available[score_sheet_index] -= adjustment

        self.game.add_pending_messages([[enums.CommandsToClient.SetScoreSheetCell.value, player_id, score_sheet_index, self.player_data[player_id][score_sheet_index]]], self.game.client_ids)

    def set_chain_size(self, game_board_type_id, chain_size):
        self.chain_size[game_board_type_id] = chain_size

        old_price = self.price[game_board_type_id]
        if chain_size:
            if chain_size < 11:
                new_price = min(chain_size, 6)
            else:
                new_price = min((chain_size - 1) // 10 + 6, 10)
            if game_board_type_id >= enums.GameBoardTypes.American.value:
                new_price += 1
            if game_board_type_id >= enums.GameBoardTypes.Continental.value:
                new_price += 1
        else:
            new_price = 0
        if new_price != old_price:
            self.price[game_board_type_id] = new_price

        self.game.add_pending_messages([[enums.CommandsToClient.SetScoreSheetCell.value, enums.ScoreSheetRows.ChainSize.value, game_board_type_id, chain_size]], self.game.client_ids)

    def get_bonuses(self, game_board_type_id):
        price = self.price[game_board_type_id]
        bonus_first = price * 10
        bonus_second = price * 5

        share_count_to_player_ids = collections.defaultdict(set)
        for player_id, player_datum in enumerate(self.player_data):
            share_count = player_datum[game_board_type_id]
            if share_count:
                share_count_to_player_ids[share_count].add(player_id)
        player_id_sets = [x[1] for x in sorted(share_count_to_player_ids.items(), reverse=True)]

        bonus_data = []

        if len(player_id_sets) == 1 and len(player_id_sets[0]) == 1:
            # if only one player holds stock in defunct chain, he receives both bonuses
            bonus_data.append([player_id_sets[0], bonus_first + bonus_second])
        elif len(player_id_sets[0]) > 1:
            # in case of tie for largest shareholder, first and second bonuses are combined and divided equally between tying shareholders
            bonus_data.append([player_id_sets[0], math.ceil((bonus_first + bonus_second) / len(player_id_sets[0]))])
        else:
            # pay largest shareholder
            bonus_data.append([player_id_sets[0], bonus_first])

            if len(player_id_sets[1]) == 1:
                # pay second largest shareholder
                bonus_data.append([player_id_sets[1], bonus_second])
            else:
                # in case of tie for second largest shareholder, second bonus is divided equally between tying players
                bonus_data.append([player_id_sets[1], math.ceil(bonus_second / len(player_id_sets[1]))])

        return bonus_data

    def update_net_worths(self):
        net_worths = []
        for player_datum in self.player_data:
            net_worths.append(player_datum[enums.ScoreSheetIndexes.Cash.value])
        for game_board_type_id, price in enumerate(self.price):
            if price:
                for player_id, player_datum in enumerate(self.player_data):
                    net_worths[player_id] += player_datum[game_board_type_id] * price
                for player_ids, bonus in self.get_bonuses(game_board_type_id):
                    for player_id in player_ids:
                        net_worths[player_id] += bonus

        for player_id, net_worth in enumerate(net_worths):
            self.player_data[player_id][enums.ScoreSheetIndexes.Net.value] = net_worth


class TileRacks:
    def __init__(self, game):
        self.game = game
        self.racks = []
        for player_id in range(self.game.num_players):
            self.racks.append([None, None, None, None, None, None])
            self.draw_tile(player_id)

    def remove_tile(self, player_id, tile_index):
        self.racks[player_id][tile_index] = None

    def draw_tile(self, player_id):
        rack = self.racks[player_id]

        for tile_index, tile_data in enumerate(rack):
            if not tile_data:
                len_tile_bag = len(self.game.tile_bag)
                if len_tile_bag:
                    rack[tile_index] = [self.game.tile_bag.pop(), None, len_tile_bag == 1]

    def determine_tile_game_board_types(self, player_ids=None):
        chain_sizes = [len(self.game.game_board.board_type_to_coordinates[t]) for t in range(7)]
        can_start_new_chain = 0 in chain_sizes
        x_to_y_to_board_type = self.game.game_board.x_to_y_to_board_type

        if player_ids is None:
            player_ids = range(len(self.racks))

        for player_id in player_ids:
            rack = self.racks[player_id]

            old_types = [t[1] if t else None for t in rack]
            new_types = []
            lonely_tile_indexes = []
            lonely_tile_border_tiles = set()
            drew_last_tile = False
            for tile_index, tile_data in enumerate(rack):
                if tile_data:
                    x, y = tile_data[0]
                    if tile_data[2] is True:
                        drew_last_tile = True
                        tile_data[2] = False

                    border_tiles = set()
                    if x:
                        border_tiles.add((x - 1, y))
                    if x < 11:
                        border_tiles.add((x + 1, y))
                    if y:
                        border_tiles.add((x, y - 1))
                    if y < 8:
                        border_tiles.add((x, y + 1))

                    border_types = {x_to_y_to_board_type[x][y] for x, y in border_tiles}
                    border_types.discard(enums.GameBoardTypes.Nothing.value)
                    border_types.discard(enums.GameBoardTypes.CantPlayEver.value)
                    if len(border_types) > 1:
                        border_types.discard(enums.GameBoardTypes.NothingYet.value)

                    len_border_types = len(border_types)
                    new_type = enums.GameBoardTypes.WillPutLonelyTileDown.value
                    if len_border_types == 0:
                        lonely_tile_indexes.append(tile_index)
                        lonely_tile_border_tiles |= border_tiles
                    elif len_border_types == 1:
                        if enums.GameBoardTypes.NothingYet.value in border_types:
                            if can_start_new_chain:
                                new_type = enums.GameBoardTypes.WillFormNewChain.value
                            else:
                                new_type = enums.GameBoardTypes.CantPlayNow.value
                        else:
                            new_type = border_types.pop()
                    elif len_border_types > 1:
                        safe_count = 0
                        for border_type in border_types:
                            if chain_sizes[border_type] >= 11:
                                safe_count += 1
                        if safe_count < 2:
                            new_type = enums.GameBoardTypes.WillMergeChains.value
                            tile_data[2] = border_types
                        else:
                            new_type = enums.GameBoardTypes.CantPlayEver.value
                else:
                    new_type = None

                new_types.append(new_type)

            if can_start_new_chain:
                for tile_index in lonely_tile_indexes:
                    if rack[tile_index][0] in lonely_tile_border_tiles:
                        new_types[tile_index] = enums.GameBoardTypes.HaveNeighboringTileToo.value

            for tile_index, tile_data in enumerate(rack):
                if tile_data:
                    tile_data[1] = new_types[tile_index]

            client = self.game.score_sheet.player_data[player_id][enums.ScoreSheetIndexes.Client.value]
            client_ids = {client.client_id} if client else None

            for tile_index, old_type in enumerate(old_types):
                new_type = new_types[tile_index]
                if new_type != old_type:
                    if old_type is None:
                        x, y = rack[tile_index][0]
                        self.game.add_history_message(enums.GameHistoryMessages.DrewTile.value, player_id, x, y, player_id=player_id)
                        if client_ids:
                            self.game.add_pending_messages([[enums.CommandsToClient.SetTile.value, tile_index, x, y, new_type]], client_ids)
                    else:
                        if client_ids:
                            self.game.add_pending_messages([[enums.CommandsToClient.SetTileGameBoardType.value, tile_index, new_type]], client_ids)

            if drew_last_tile:
                self.game.add_history_message(enums.GameHistoryMessages.DrewLastTile.value, player_id)

    def replace_dead_tiles(self, player_id):
        rack = self.racks[player_id]
        replaced_a_dead_tile = True
        while replaced_a_dead_tile:
            replaced_a_dead_tile = False
            for tile_index, tile_data in enumerate(rack):
                if tile_data and tile_data[1] == enums.GameBoardTypes.CantPlayEver.value:
                    # remove tile from player's tile rack
                    rack[tile_index] = None
                    client = self.game.score_sheet.player_data[player_id][enums.ScoreSheetIndexes.Client.value]
                    if client:
                        self.game.add_pending_messages([[enums.CommandsToClient.RemoveTile.value, tile_index]], {client.client_id})

                    # mark cell on game board as can't play ever
                    tile = tile_data[0]
                    self.game.game_board.set_cell(tile, enums.GameBoardTypes.CantPlayEver.value)

                    # tell everybody that a dead tile was replaced
                    self.game.add_history_message(enums.GameHistoryMessages.ReplacedDeadTile.value, player_id, tile[0], tile[1])

                    # draw new tile
                    self.draw_tile(player_id)
                    self.determine_tile_game_board_types([player_id])

                    # repeat
                    replaced_a_dead_tile = True

                    # replace one tile at a time
                    break

    def are_racks_empty(self):
        for rack in self.racks:
            for tile_data in rack:
                if tile_data:
                    return False
        return True


class Action:
    def __init__(self, game, player_id, game_action_id):
        self.game = game
        self.player_id = player_id
        self.game_action_id = game_action_id
        self.additional_params = []

    def prepare(self):
        pass

    def send_message(self, client_ids):
        self.game.add_pending_messages([[enums.CommandsToClient.SetGameAction.value, self.game_action_id, self.player_id] + self.additional_params], client_ids)


class ActionStartGame(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions.StartGame.value)

    def execute(self):
        self.game.add_history_message(enums.GameHistoryMessages.StartedGame.value, self.player_id)

        if self.game.mode == enums.GameModes.Teams.value and self.game.num_players < 4:
            self.game.set_state(enums.GameStates.InProgress.value, enums.GameModes.Singles.value)
        else:
            self.game.set_state(enums.GameStates.InProgress.value)

        self.game.tile_racks = TileRacks(self.game)
        self.game.tile_racks.determine_tile_game_board_types()

        return [ActionPlayTile(self.game, 0), ActionPurchaseShares(self.game, 0)]


class ActionPlayTile(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions.PlayTile.value)

    def prepare(self):
        self.game.turn_player_id = self.player_id

        self.game.add_pending_messages([[enums.CommandsToClient.SetTurn.value, self.player_id]], self.game.client_ids)
        self.game.add_history_message(enums.GameHistoryMessages.TurnBegan.value, self.player_id)

        has_a_playable_tile = False
        for tile_data in self.game.tile_racks.racks[self.player_id]:
            if tile_data and tile_data[1] != enums.GameBoardTypes.CantPlayNow.value and tile_data[1] != enums.GameBoardTypes.CantPlayEver.value:
                has_a_playable_tile = True
                break

        if has_a_playable_tile:
            self.game.turns_without_played_tiles_count = 0
        else:
            self.game.turns_without_played_tiles_count += 1
            self.game.add_history_message(enums.GameHistoryMessages.HasNoPlayableTile.value, self.player_id)
            return True

    def execute(self, tile_index):
        if not isinstance(tile_index, int):
            return
        rack = self.game.tile_racks.racks[self.player_id]
        if tile_index < 0 or tile_index >= len(rack):
            return
        tile_data = rack[tile_index]
        if not tile_data:
            return

        tile, game_board_type_id, borders = tile_data
        retval = True

        if game_board_type_id <= enums.GameBoardTypes.Imperial.value:
            self.game.game_board.fill_cells(tile, game_board_type_id)
            self.game.score_sheet.set_chain_size(game_board_type_id, len(self.game.game_board.board_type_to_coordinates[game_board_type_id]))
        elif game_board_type_id == enums.GameBoardTypes.WillPutLonelyTileDown.value or game_board_type_id == enums.GameBoardTypes.HaveNeighboringTileToo.value:
            self.game.game_board.set_cell(tile, enums.GameBoardTypes.NothingYet.value)
        elif game_board_type_id == enums.GameBoardTypes.WillFormNewChain.value:
            retval = [ActionSelectNewChain(self.game, self.player_id, [index for index, size in enumerate(self.game.score_sheet.chain_size) if size == 0], tile)]
        elif game_board_type_id == enums.GameBoardTypes.WillMergeChains.value:
            retval = [ActionSelectMergerSurvivor(self.game, self.player_id, borders, tile)]
        else:
            return

        self.game.tile_racks.remove_tile(self.player_id, tile_index)

        self.game.add_history_message(enums.GameHistoryMessages.PlayedTile.value, self.player_id, tile[0], tile[1])

        return retval


class ActionSelectNewChain(Action):
    def __init__(self, game, player_id, game_board_type_ids, tile):
        super().__init__(game, player_id, enums.GameActions.SelectNewChain.value)
        self.game_board_type_ids = game_board_type_ids
        self.additional_params.append(game_board_type_ids)
        self.tile = tile

    def prepare(self):
        if len(self.game_board_type_ids) == 1:
            return self._create_new_chain(self.game_board_type_ids[0])
        else:
            self.game.game_board.set_cell(self.tile, enums.GameBoardTypes.NothingYet.value)
            self.game.tile_racks.determine_tile_game_board_types()

    def execute(self, game_board_type_id):
        if game_board_type_id in self.game_board_type_ids:
            return self._create_new_chain(game_board_type_id)

    def _create_new_chain(self, game_board_type_id):
        self.game.game_board.fill_cells(self.tile, game_board_type_id)
        self.game.score_sheet.set_chain_size(game_board_type_id, len(self.game.game_board.board_type_to_coordinates[game_board_type_id]))
        if self.game.score_sheet.available[game_board_type_id]:
            self.game.score_sheet.adjust_player_data(self.player_id, game_board_type_id, 1)

        self.game.add_history_message(enums.GameHistoryMessages.FormedChain.value, self.player_id, game_board_type_id)

        return True


class ActionSelectMergerSurvivor(Action):
    def __init__(self, game, player_id, type_ids, tile):
        super().__init__(game, player_id, enums.GameActions.SelectMergerSurvivor.value)
        self.type_ids = type_ids
        self.tile = tile

        chain_size_to_type_ids = collections.defaultdict(set)
        for type_id in type_ids:
            chain_size_to_type_ids[self.game.score_sheet.chain_size[type_id]].add(type_id)
        self.type_id_sets = [x[1] for x in sorted(chain_size_to_type_ids.items(), reverse=True)]

    def prepare(self):
        self.game.add_history_message(enums.GameHistoryMessages.MergedChains.value, self.player_id, sorted(self.type_ids))

        largest_type_ids = self.type_id_sets[0]
        if len(largest_type_ids) == 1:
            return self._prepare_next_actions(largest_type_ids.pop())
        else:
            self.game.game_board.set_cell(self.tile, enums.GameBoardTypes.NothingYet.value)
            self.game.tile_racks.determine_tile_game_board_types()
            self.additional_params.append(sorted(largest_type_ids))

    def execute(self, type_id):
        if type_id in self.type_id_sets[0]:
            self.game.add_history_message(enums.GameHistoryMessages.SelectedMergerSurvivor.value, self.player_id, type_id)

            return self._prepare_next_actions(type_id)

    def _prepare_next_actions(self, controlling_type_id):
        self.type_id_sets[0].discard(controlling_type_id)

        self.game.game_board.fill_cells(self.tile, controlling_type_id)
        self.game.score_sheet.set_chain_size(controlling_type_id, len(self.game.game_board.board_type_to_coordinates[controlling_type_id]))
        self.game.tile_racks.determine_tile_game_board_types()

        # pay bonuses
        type_ids = set()
        for type_id_set in self.type_id_sets:
            type_ids |= type_id_set
        bonuses = [0] * self.game.num_players
        for type_id in sorted(type_ids):
            for player_ids, bonus in self.game.score_sheet.get_bonuses(type_id):
                for player_id in sorted(player_ids):
                    bonuses[player_id] += bonus
                    self.game.add_history_message(enums.GameHistoryMessages.ReceivedBonus.value, player_id, type_id, bonus)
        for player_id, bonus in enumerate(bonuses):
            if bonus:
                self.game.score_sheet.adjust_player_data(player_id, enums.ScoreSheetIndexes.Cash.value, bonus)

        actions = []
        for type_id_set in self.type_id_sets:
            if type_id_set:
                actions.append(ActionSelectChainToDisposeOfNext(self.game, self.player_id, type_id_set, controlling_type_id))

        return actions


class ActionSelectChainToDisposeOfNext(Action):
    def __init__(self, game, player_id, defunct_type_ids, controlling_type_id):
        super().__init__(game, player_id, enums.GameActions.SelectChainToDisposeOfNext.value)
        self.defunct_type_ids = defunct_type_ids
        self.controlling_type_id = controlling_type_id

    def prepare(self):
        if len(self.defunct_type_ids) == 1:
            return self._prepare_next_actions(self.defunct_type_ids.pop())
        else:
            self.additional_params.append(sorted(self.defunct_type_ids))

    def execute(self, type_id):
        if type_id in self.defunct_type_ids:
            self.game.add_history_message(enums.GameHistoryMessages.SelectedChainToDisposeOfNext.value, self.player_id, type_id)

            return self._prepare_next_actions(type_id)

    def _prepare_next_actions(self, next_type_id):
        self.defunct_type_ids.discard(next_type_id)

        actions = []
        player_ids = list(range(self.player_id, self.game.num_players)) + list(range(self.player_id))
        for player_id in player_ids:
            if self.game.score_sheet.player_data[player_id][next_type_id]:
                actions.append(ActionDisposeOfShares(self.game, player_id, next_type_id, self.controlling_type_id))

        if self.defunct_type_ids:
            actions.append(ActionSelectChainToDisposeOfNext(self.game, self.player_id, self.defunct_type_ids, self.controlling_type_id))

        return actions


class ActionDisposeOfShares(Action):
    def __init__(self, game, player_id, defunct_type_id, controlling_type_id):
        super().__init__(game, player_id, enums.GameActions.DisposeOfShares.value)
        self.defunct_type_id = defunct_type_id
        self.controlling_type_id = controlling_type_id
        self.defunct_type_count = self.game.score_sheet.player_data[self.player_id][self.defunct_type_id]
        self.controlling_type_available = 0
        self.additional_params.append(defunct_type_id)
        self.additional_params.append(controlling_type_id)

    def prepare(self):
        self.controlling_type_available = self.game.score_sheet.available[self.controlling_type_id]

    def execute(self, trade_amount, sell_amount):
        if not isinstance(trade_amount, int) or trade_amount < 0 or trade_amount % 2 != 0 or trade_amount // 2 > self.controlling_type_available:
            return
        if not isinstance(sell_amount, int) or sell_amount < 0:
            return
        if trade_amount + sell_amount > self.defunct_type_count:
            return

        if trade_amount or sell_amount:
            self.game.score_sheet.adjust_player_data(self.player_id, self.defunct_type_id, -trade_amount - sell_amount)
            if trade_amount:
                self.game.score_sheet.adjust_player_data(self.player_id, self.controlling_type_id, trade_amount // 2)
            if sell_amount:
                sale_price = self.game.score_sheet.price[self.defunct_type_id] * sell_amount
                self.game.score_sheet.adjust_player_data(self.player_id, enums.ScoreSheetIndexes.Cash.value, sale_price)

        self.game.add_history_message(enums.GameHistoryMessages.DisposedOfShares.value, self.player_id, self.defunct_type_id, trade_amount, sell_amount)

        return True


class ActionPurchaseShares(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions.PurchaseShares.value)
        self.can_not_afford_any_shares = False
        self.can_end_game = False
        self.end_game = False

    def prepare(self):
        for type_id, chain_size in enumerate(self.game.score_sheet.chain_size):
            if chain_size and not self.game.game_board.board_type_to_coordinates[type_id]:
                self.game.score_sheet.set_chain_size(type_id, 0)

        self.game.tile_racks.determine_tile_game_board_types()

        existing_chain_sizes = []
        shares_available = False
        can_purchase_shares = False
        cash = self.game.score_sheet.player_data[self.player_id][enums.ScoreSheetIndexes.Cash.value]
        for chain_size, available, price in zip(self.game.score_sheet.chain_size, self.game.score_sheet.available, self.game.score_sheet.price):
            if chain_size:
                existing_chain_sizes.append(chain_size)
                if available:
                    shares_available = True
                    if price <= cash:
                        can_purchase_shares = True
        self.can_not_afford_any_shares = shares_available and not can_purchase_shares
        self.can_end_game = existing_chain_sizes and (min(existing_chain_sizes) >= 11 or max(existing_chain_sizes) >= 41)

        if not can_purchase_shares and not self.can_end_game:
            if self.can_not_afford_any_shares:
                self.game.add_history_message(enums.GameHistoryMessages.CouldNotAffordAnyShares.value, self.player_id)
            return self._complete_action()

    def execute(self, game_board_type_ids, end_game):
        if end_game != 0 and end_game != 1:
            return
        if not isinstance(game_board_type_ids, list) or len(game_board_type_ids) > 3:
            return
        game_board_type_id_to_count = collections.defaultdict(int)
        for game_board_type_id in game_board_type_ids:
            if isinstance(game_board_type_id, int) and 0 <= game_board_type_id < 7:
                game_board_type_id_to_count[game_board_type_id] += 1
            else:
                return

        cost = 0
        for game_board_type_id, count in game_board_type_id_to_count.items():
            if self.game.score_sheet.chain_size[game_board_type_id] and count <= self.game.score_sheet.available[game_board_type_id]:
                cost += self.game.score_sheet.price[game_board_type_id] * count
            else:
                return
        if cost > self.game.score_sheet.player_data[self.player_id][enums.ScoreSheetIndexes.Cash.value]:
            return

        if cost:
            for game_board_type_id, count in game_board_type_id_to_count.items():
                self.game.score_sheet.adjust_player_data(self.player_id, game_board_type_id, count)
            self.game.score_sheet.adjust_player_data(self.player_id, enums.ScoreSheetIndexes.Cash.value, -cost)

        if self.can_not_afford_any_shares:
            self.game.add_history_message(enums.GameHistoryMessages.CouldNotAffordAnyShares.value, self.player_id)
        else:
            self.game.add_history_message(enums.GameHistoryMessages.PurchasedShares.value, self.player_id, sorted(list(x) for x in game_board_type_id_to_count.items()))

        if end_game and self.can_end_game:
            self.end_game = True

        return self._complete_action()

    def _complete_action(self):
        all_tiles_played = self.game.tile_racks.are_racks_empty()
        no_tiles_played_for_entire_round = self.game.turns_without_played_tiles_count == self.game.num_players

        if self.end_game or all_tiles_played or no_tiles_played_for_entire_round:
            if self.end_game:
                self.game.add_history_message(enums.GameHistoryMessages.EndedGame.value, self.player_id)
            elif all_tiles_played:
                self.game.add_history_message(enums.GameHistoryMessages.AllTilesPlayed.value, None)
            elif no_tiles_played_for_entire_round:
                self.game.add_history_message(enums.GameHistoryMessages.NoTilesPlayedForEntireRound.value, None)

            return [ActionGameOver(self.game)]
        else:
            self.game.tile_racks.draw_tile(self.player_id)
            self.game.tile_racks.determine_tile_game_board_types([self.player_id])
            self.game.tile_racks.replace_dead_tiles(self.player_id)

            all_tiles_played = self.game.tile_racks.are_racks_empty()
            if all_tiles_played:
                self.game.add_history_message(enums.GameHistoryMessages.AllTilesPlayed.value, None)
                return [ActionGameOver(self.game)]

            next_player_id = (self.player_id + 1) % self.game.num_players
            return [ActionPlayTile(self.game, next_player_id), ActionPurchaseShares(self.game, next_player_id)]


class ActionGameOver(Action):
    def __init__(self, game):
        super().__init__(game, None, enums.GameActions.GameOver.value)
        game.turn_player_id = None
        game.add_pending_messages([[enums.CommandsToClient.SetTurn.value, None]], game.client_ids)
        game.set_state(enums.GameStates.Completed.value)


class Game:
    def __init__(self, game_id, internal_game_id, mode, max_players, add_pending_messages, logging_enabled=True, tile_bag=None):
        self.game_id = game_id
        self.internal_game_id = internal_game_id
        self.state = enums.GameStates.Starting.value
        self.mode = mode
        self.max_players = max_players if mode == enums.GameModes.Singles.value else 4
        self.add_pending_messages = add_pending_messages
        self.logging_enabled = logging_enabled
        self.num_players = 0
        self.client_ids = set()
        self.watcher_client_ids = set()

        self.game_board = GameBoard(self)
        self.score_sheet = ScoreSheet(self)
        if tile_bag is None:
            tiles = [(x, y) for x in range(12) for y in range(9)]
            random.shuffle(tiles)
            self.tile_bag = tiles
        else:
            self.tile_bag = tile_bag
        self.tile_racks = None

        self.actions = []
        self.turn_player_id = None
        self.turns_without_played_tiles_count = 0
        self.history_messages = []
        self.expiration_time = None

        self.log_data_overrides = {}

        self.set_state(self.state, self.mode, self.max_players)

    def join_game(self, client):
        if self.state == enums.GameStates.Starting.value and not self.score_sheet.is_username_in_game(client.username):
            self.num_players += 1
            client.game_id = self.game_id
            self.client_ids.add(client.client_id)
            position_tile = self.tile_bag.pop()
            previous_creator_player_id = self.score_sheet.get_creator_player_id()
            self.score_sheet.join_game(client, position_tile)
            self._send_past_history_messages(client)
            self.game_board.set_cell(position_tile, enums.GameBoardTypes.NothingYet.value)
            self.add_history_message(enums.GameHistoryMessages.DrewPositionTile.value, client.username, position_tile[0], position_tile[1])
            creator_player_id = self.score_sheet.get_creator_player_id()
            if creator_player_id != previous_creator_player_id:
                del self.actions[:]
                self.actions.append(ActionStartGame(self, creator_player_id))
                self.actions[-1].send_message(self.client_ids)
            else:
                self.actions[-1].send_message({client.client_id})
            if self.num_players == self.max_players:
                self.set_state(enums.GameStates.StartingFull.value)
            self.expiration_time = None

    def rejoin_game(self, client):
        if self.score_sheet.is_username_in_game(client.username):
            client.game_id = self.game_id
            self.client_ids.add(client.client_id)
            self.score_sheet.rejoin_game(client)
            self._send_initialization_messages(client)
            self._send_past_history_messages(client)
            self.expiration_time = None

    def watch_game(self, client):
        if not self.score_sheet.is_username_in_game(client.username):
            client.game_id = self.game_id
            self.client_ids.add(client.client_id)
            self.watcher_client_ids.add(client.client_id)
            self.add_pending_messages([[enums.CommandsToClient.SetGameWatcherClientId.value, self.game_id, client.client_id]])
            self._send_initialization_messages(client)
            self._send_past_history_messages(client)
            self.expiration_time = None

    def leave_game(self, client):
        if client.client_id in self.client_ids:
            client.game_id = None
            self.client_ids.discard(client.client_id)
            if client.client_id in self.watcher_client_ids:
                self.watcher_client_ids.discard(client.client_id)
                self.add_pending_messages([[enums.CommandsToClient.ReturnWatcherToLobby.value, self.game_id, client.client_id]])
            else:
                self.score_sheet.leave_game(client)
            if not self.client_ids:
                self.expiration_time = time.time() + 300

    def do_game_action(self, client, game_action_id, data):
        action = self.actions[-1]
        if client.player_id is not None and client.player_id == action.player_id and game_action_id == action.game_action_id:
            new_actions = action.execute(*data)
            while new_actions:
                self.actions.pop()
                if isinstance(new_actions, list):
                    new_actions.reverse()
                    self.actions.extend(new_actions)
                action = self.actions[-1]
                new_actions = action.prepare()
            action.send_message(self.client_ids)

    def set_state(self, state, mode=None, max_players=None):
        log = collections.OrderedDict()
        log['_'] = 'game'
        log['game-id'] = self.internal_game_id
        log['external-game-id'] = self.game_id
        log['state'] = enums.GameStates(state).name

        self.state = state
        if mode is not None:
            self.mode = mode
            log['mode'] = enums.GameModes(mode).name
        if max_players is not None:
            self.max_players = max_players
            log['max-players'] = max_players

        if state == enums.GameStates.Starting.value:
            log['tile-bag'] = self.tile_bag
        if state == enums.GameStates.InProgress.value:
            log['begin'] = int(time.time())
        if state == enums.GameStates.Completed.value:
            log['end'] = int(time.time())
            self.score_sheet.update_net_worths()
            score = [player_datum[enums.ScoreSheetIndexes.Net.value] for player_datum in self.score_sheet.player_data]
            log['score'] = score
        else:
            score = None

        if self.log_data_overrides:
            if 'log-time' in self.log_data_overrides:
                log['log-time'] = self.log_data_overrides['log-time']
            for key, value in self.log_data_overrides.items():
                if key in log:
                    log[key] = value
            log['used-log-data-overrides'] = True

        message = [enums.CommandsToClient.SetGameState.value, self.game_id, self.state]
        if mode is not None or max_players or score:
            message.append(self.mode)
        if max_players or score:
            message.append(self.max_players)
        if score:
            message.append(score)
        self.add_pending_messages([message])

        if self.logging_enabled:
            print(json.dumps(log, separators=(',', ':')))

    def add_history_message(self, *data, player_id=None):
        data = list(data)

        self.history_messages.append([player_id, data])

        if player_id is None:
            client_ids = self.client_ids
        else:
            client = self.score_sheet.player_data[player_id][enums.ScoreSheetIndexes.Client.value]
            if client:
                client_ids = {client.client_id}
            else:
                client_ids = None

        if client_ids:
            message = [enums.CommandsToClient.AddGameHistoryMessage.value]
            message.extend(data)
            if isinstance(message[2], str):
                message[2] = self.score_sheet.username_to_player_id[message[2]]
            self.add_pending_messages([message], client_ids)

    def _send_past_history_messages(self, client):
        player_id = client.player_id
        messages = []
        for target_player_id, message in self.history_messages:
            if target_player_id is None or target_player_id == player_id:
                if isinstance(message[1], str):
                    message = list(message)
                    message[1] = self.score_sheet.username_to_player_id[message[1]]
                messages.append(message)

        if messages:
            self.add_pending_messages([[enums.CommandsToClient.AddGameHistoryMessages.value, messages]], {client.client_id})

    def _send_initialization_messages(self, client):
        # game board
        messages = [[enums.CommandsToClient.SetGameBoard.value, self.game_board.x_to_y_to_board_type]]

        # score sheet
        score_sheet_data = [
            [x[:enums.ScoreSheetIndexes.Cash.value + 1] for x in self.score_sheet.player_data],
            self.score_sheet.chain_size,
        ]
        messages.append([enums.CommandsToClient.SetScoreSheet.value, score_sheet_data])

        # player's tiles
        if client.player_id is not None and self.tile_racks:
            for tile_index, tile_data in enumerate(self.tile_racks.racks[client.player_id]):
                if tile_data:
                    x, y = tile_data[0]
                    messages.append([enums.CommandsToClient.SetTile.value, tile_index, x, y, tile_data[1]])

        # turn
        messages.append([enums.CommandsToClient.SetTurn.value, self.turn_player_id])

        self.add_pending_messages(messages, {client.client_id})

        # action
        self.actions[-1].send_message({client.client_id})


def main():
    server = Server()
    server_protocol = ServerProtocol(server)

    # import recreate_game
    # recreate_game.recreate_some_games(server)

    loop = asyncio.get_event_loop()

    loop.run_until_complete(loop.create_unix_server(lambda: server_protocol, 'python.sock'))

    def destroy_expired_games_loop():
        server.destroy_expired_games()
        loop.call_later(15, destroy_expired_games_loop)

    loop.call_later(15, destroy_expired_games_loop)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    except:
        traceback.print_exc()


if __name__ == '__main__':
    main()
