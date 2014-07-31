#!/usr/bin/env python3.4m

import asyncio
import autobahn.asyncio.websocket
import autobahn.websocket.protocol
import collections
import enums
import math
import random
import re
import sys
import time
import traceback
import ujson


# override broken autobahn.websocket.protocol.PreparedMessage::_initHixie() as it tries to concatenate strings and bytes
class PreparedMessage(autobahn.websocket.protocol.PreparedMessage):
    def _initHixie(self, payload, binary):
        pass


class AcquireServerProtocol(autobahn.asyncio.websocket.WebSocketServerProtocol):
    next_client_id = 1
    client_id_to_client = {}
    client_ids = set()
    client_id_to_last_sent = collections.OrderedDict()
    client_id_to_last_received = collections.OrderedDict()
    usernames = set()
    next_game_id = 1
    game_id_to_game = {}
    client_ids_and_messages = []
    version = 'VERSION'

    _re_whitespace = re.compile(r'\s')

    def __init__(self):
        self.version = None
        self.username = ''
        self.ip_address = None
        self.client_id = None
        self.logged_in = False
        self.game_id = None
        self.player_id = None

        self.on_message_lookup = []
        for command_enum in enums.CommandsToServer:
            self.on_message_lookup.append(getattr(self, 'onMessage' + command_enum.name))

    def onConnect(self, request):
        self.version = ' '.join(request.params.get('version', [''])[0].split())
        self.username = ' '.join(request.params.get('username', [''])[0].split())
        self.ip_address = request.headers.get('x-real-ip', self.peer)
        print('X', 'connect', self.ip_address, self.username)
        print()

    def onOpen(self):
        self.client_id = AcquireServerProtocol.next_client_id
        AcquireServerProtocol.next_client_id += 1
        AcquireServerProtocol.client_id_to_client[self.client_id] = self
        AcquireServerProtocol.client_ids.add(self.client_id)
        current_time = time.time()
        AcquireServerProtocol.client_id_to_last_sent[self.client_id] = current_time
        AcquireServerProtocol.client_id_to_last_received[self.client_id] = current_time
        messages_client = []

        print(self.client_id, 'open', self.ip_address)

        if self.version != AcquireServerProtocol.version:
            messages_client.append([enums.CommandsToClient.FatalError.value, enums.FatalErrors.NotUsingLatestVersion.value])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            AcquireServerProtocol.flush_pending_messages()
            self.sendClose()
        elif not self.username or len(self.username) > 32:
            messages_client.append([enums.CommandsToClient.FatalError.value, enums.FatalErrors.InvalidUsername.value])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            AcquireServerProtocol.flush_pending_messages()
            self.sendClose()
        elif self.username in AcquireServerProtocol.usernames:
            messages_client.append([enums.CommandsToClient.FatalError.value, enums.FatalErrors.UsernameAlreadyInUse.value])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            AcquireServerProtocol.flush_pending_messages()
            self.sendClose()
        else:
            self.logged_in = True
            AcquireServerProtocol.usernames.add(self.username)

            messages_client.append([enums.CommandsToClient.SetClientId.value, self.client_id])

            # tell client about other clients' data
            for client in AcquireServerProtocol.client_id_to_client.values():
                if client is not self:
                    messages_client.append([enums.CommandsToClient.SetClientIdToData.value, client.client_id, client.username, client.ip_address])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            messages_client = []

            # tell all clients about client's data
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetClientIdToData.value, self.client_id, self.username, self.ip_address]])

            # tell client about all games
            for game_id, game in sorted(AcquireServerProtocol.game_id_to_game.items()):
                messages_client.append([enums.CommandsToClient.SetGameState.value, game_id, game.state, game.mode, game.max_players])
                for player_id, player_datum in enumerate(game.score_sheet.player_data):
                    if player_datum[enums.ScoreSheetIndexes.Client.value]:
                        messages_client.append([enums.CommandsToClient.SetGamePlayerClientId.value, game_id, player_id, player_datum[enums.ScoreSheetIndexes.Client.value].client_id])
                    else:
                        messages_client.append([enums.CommandsToClient.SetGamePlayerUsername.value, game_id, player_id, player_datum[enums.ScoreSheetIndexes.Username.value]])
                for client_id in game.watcher_client_ids:
                    messages_client.append([enums.CommandsToClient.SetGameWatcherClientId.value, game_id, client_id])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)

            AcquireServerProtocol.flush_pending_messages()

    def onClose(self, wasClean, code, reason):
        print(self.client_id, 'close')

        if self.client_id:
            del AcquireServerProtocol.client_id_to_client[self.client_id]
            AcquireServerProtocol.client_ids.remove(self.client_id)
            del AcquireServerProtocol.client_id_to_last_sent[self.client_id]
            del AcquireServerProtocol.client_id_to_last_received[self.client_id]

        if self.game_id:
            AcquireServerProtocol.game_id_to_game[self.game_id].remove_client(self)

        if self.logged_in:
            AcquireServerProtocol.usernames.remove(self.username)
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetClientIdToData.value, self.client_id, None, None]])
            AcquireServerProtocol.flush_pending_messages()
        else:
            print()

    def onMessage(self, payload, isBinary):
        del AcquireServerProtocol.client_id_to_last_received[self.client_id]
        AcquireServerProtocol.client_id_to_last_received[self.client_id] = time.time()

        if not isBinary:
            try:
                message = payload.decode()
                print(self.client_id, '->', AcquireServerProtocol._re_whitespace.sub(' ', message))
                message = ujson.decode(message)
                method = self.on_message_lookup[message[0]]
                arguments = message[1:]
            except:
                traceback.print_exc()
                self.sendClose()
                return

            try:
                method(*arguments)
                AcquireServerProtocol.flush_pending_messages()
            except TypeError:
                traceback.print_exc()
                self.sendClose()
        else:
            self.sendClose()

    def onMessageCreateGame(self, mode, max_players):
        if not self.game_id and isinstance(mode, int) and 0 <= mode < enums.GameModes.Max.value and isinstance(max_players, int) and 1 <= max_players <= 6:
            AcquireServerProtocol.game_id_to_game[AcquireServerProtocol.next_game_id] = Game(AcquireServerProtocol.next_game_id, self, mode, max_players)
            AcquireServerProtocol.next_game_id += 1

    def onMessageJoinGame(self, game_id):
        if not self.game_id and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].join_game(self)

    def onMessageRejoinGame(self, game_id):
        if not self.game_id and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].rejoin_game(self)

    def onMessageWatchGame(self, game_id):
        if not self.game_id and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].watch_game(self)

    def onMessageLeaveGame(self):
        if self.game_id:
            AcquireServerProtocol.game_id_to_game[self.game_id].remove_client(self)

    def onMessageDoGameAction(self, game_action_id, *data):
        if self.game_id:
            AcquireServerProtocol.game_id_to_game[self.game_id].do_game_action(self, game_action_id, data)

    def onMessageSendGlobalChatMessage(self, chat_message):
        chat_message = ' '.join(chat_message.split())
        if chat_message:
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.AddGlobalChatMessage.value, self.client_id, chat_message]])

    def onMessageSendGameChatMessage(self, chat_message):
        if self.game_id:
            chat_message = ' '.join(chat_message.split())
            if chat_message:
                AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.game_id_to_game[self.game_id].client_ids, [[enums.CommandsToClient.AddGameChatMessage.value, self.client_id, chat_message]])

    def onMessageHeartbeat(self):
        pass

    @staticmethod
    def add_pending_messages(client_ids, messages):
        client_ids = client_ids.copy()
        new_list = []
        for client_ids2, messages2 in AcquireServerProtocol.client_ids_and_messages:
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
        AcquireServerProtocol.client_ids_and_messages = new_list

    @staticmethod
    def flush_pending_messages():
        current_time = time.time()
        for client_ids, messages in AcquireServerProtocol.client_ids_and_messages:
            messages_json = ujson.dumps(messages)
            print(','.join(str(x) for x in sorted(client_ids)), '<-', messages_json)
            messages_json_bytes = messages_json.encode()
            prepared_message = PreparedMessage(messages_json_bytes, False, False, False)
            for client_id in client_ids:
                AcquireServerProtocol.client_id_to_client[client_id].sendPreparedMessage(prepared_message)
                del AcquireServerProtocol.client_id_to_last_sent[client_id]
                AcquireServerProtocol.client_id_to_last_sent[client_id] = current_time
        del AcquireServerProtocol.client_ids_and_messages[:]
        print()

    @staticmethod
    def do_heartbeat_management():
        current_time = time.time()
        print_blank_line = False

        threshold = current_time - 20
        client_ids = set()
        for client_id, last_sent in AcquireServerProtocol.client_id_to_last_sent.items():
            if last_sent < threshold:
                print(client_id, 'send timeout')
                client_ids.add(client_id)
            else:
                break

        threshold = current_time - 35
        for client_id, last_received in AcquireServerProtocol.client_id_to_last_received.items():
            if last_received < threshold:
                print(client_id, 'receive timeout')
                print_blank_line = True
                AcquireServerProtocol.client_id_to_client[client_id].sendClose()
            else:
                break

        if client_ids:
            AcquireServerProtocol.add_pending_messages(client_ids, [[enums.CommandsToClient.Heartbeat.value]])
            AcquireServerProtocol.flush_pending_messages()
            print_blank_line = False

        if print_blank_line:
            print()

        asyncio.get_event_loop().call_later(2, AcquireServerProtocol.do_heartbeat_management)

    @staticmethod
    def destroy_expired_games():
        current_time = time.time()
        expired_game_ids = []

        for game_id, game in AcquireServerProtocol.game_id_to_game.items():
            if game.expiration_time and game.expiration_time <= current_time:
                expired_game_ids.append(game_id)

        if expired_game_ids:
            messages = []
            for game_id in expired_game_ids:
                print('game #%d expired' % game_id)
                del AcquireServerProtocol.game_id_to_game[game_id]
                messages.append([enums.CommandsToClient.DestroyGame.value, game_id])
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, messages)
            AcquireServerProtocol.flush_pending_messages()

        asyncio.get_event_loop().call_later(15, AcquireServerProtocol.destroy_expired_games)


class GameBoard:
    def __init__(self, client_ids):
        self.client_ids = client_ids

        self.x_to_y_to_board_type = [[enums.GameBoardTypes.Nothing.value for y in range(9)] for x in range(12)]
        self.board_type_to_coordinates = [set() for t in range(enums.GameBoardTypes.Max.value)]
        self.board_type_to_coordinates[enums.GameBoardTypes.Nothing.value].update((x, y) for x in range(12) for y in range(9))

    def _set_cell(self, coordinates, board_type):
        x, y = coordinates
        old_board_type = self.x_to_y_to_board_type[x][y]
        self.board_type_to_coordinates[old_board_type].remove(coordinates)
        self.x_to_y_to_board_type[x][y] = board_type
        self.board_type_to_coordinates[board_type].add(coordinates)
        return [enums.CommandsToClient.SetGameBoardCell.value, x, y, board_type]

    def set_cell(self, coordinates, board_type):
        AcquireServerProtocol.add_pending_messages(self.client_ids, [self._set_cell(coordinates, board_type)])

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

        AcquireServerProtocol.add_pending_messages(self.client_ids, messages)


class ScoreSheet:
    def __init__(self, game_id, client_ids):
        self.game_id = game_id
        self.client_ids = client_ids

        self.player_data = []
        self.available = [25, 25, 25, 25, 25, 25, 25]
        self.chain_size = [0, 0, 0, 0, 0, 0, 0]
        self.price = [0, 0, 0, 0, 0, 0, 0]

        self.creator_username = None
        self.username_to_player_id = {}

    def add_player(self, client, position_tile):
        messages_all = []
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

        for player_id in range(len(self.player_data) - 1, -1, -1):
            player_datum = self.player_data[player_id]

            # tell everybody about player changes
            if player_id >= client.player_id:
                if player_datum[enums.ScoreSheetIndexes.Client.value]:
                    messages_all.append([enums.CommandsToClient.SetGamePlayerClientId.value, self.game_id, player_id, player_datum[enums.ScoreSheetIndexes.Client.value].client_id])
                else:
                    messages_all.append([enums.CommandsToClient.SetGamePlayerUsername.value, self.game_id, player_id, player_datum[enums.ScoreSheetIndexes.Username.value]])
                self.username_to_player_id[player_datum[enums.ScoreSheetIndexes.Username.value]] = player_id

            # tell client about other position tiles
            if player_id != client.player_id:
                x, y = player_datum[enums.ScoreSheetIndexes.PositionTile.value]
                messages_client.append([enums.CommandsToClient.SetGameBoardCell.value, x, y, enums.GameBoardTypes.NothingYet.value])

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, messages_all)
        if messages_client:
            AcquireServerProtocol.add_pending_messages({client.client_id}, messages_client)

    def readd_player(self, client):
        player_id = self.username_to_player_id[client.username]
        client.player_id = player_id
        self.player_data[player_id][enums.ScoreSheetIndexes.Client.value] = client
        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGamePlayerClientId.value, self.game_id, player_id, client.client_id]])

    def remove_client(self, client):
        player_id = client.player_id
        client.player_id = None
        self.player_data[player_id][enums.ScoreSheetIndexes.Client.value] = None
        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGamePlayerClientId.value, self.game_id, player_id, None]])

    def is_username_in_game(self, username):
        return username in self.username_to_player_id

    def get_creator_player_id(self):
        return self.username_to_player_id[self.creator_username] if self.creator_username else None

    def adjust_player_data(self, player_id, score_sheet_index, adjustment):
        messages = []

        self.player_data[player_id][score_sheet_index] += adjustment
        messages.append([enums.CommandsToClient.SetScoreSheetCell.value, player_id, score_sheet_index, self.player_data[player_id][score_sheet_index]])

        if score_sheet_index <= enums.ScoreSheetIndexes.Imperial.value:
            self.available[score_sheet_index] -= adjustment

        AcquireServerProtocol.add_pending_messages(self.client_ids, messages)

    def set_chain_size(self, game_board_type_id, chain_size):
        messages = []

        self.chain_size[game_board_type_id] = chain_size
        messages.append([enums.CommandsToClient.SetScoreSheetCell.value, enums.ScoreSheetRows.ChainSize.value, game_board_type_id, chain_size])

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

        AcquireServerProtocol.add_pending_messages(self.client_ids, messages)

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

    def draw_initial_tiles(self):
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
            lonely_tile_indexes = set()
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
                        lonely_tile_indexes.add(tile_index)
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
                    if new_types[tile_index] == enums.GameBoardTypes.WillPutLonelyTileDown.value and rack[tile_index][0] in lonely_tile_border_tiles:
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
                            AcquireServerProtocol.add_pending_messages(client_ids, [[enums.CommandsToClient.SetTile.value, tile_index, x, y, new_type]])
                    else:
                        if client_ids:
                            AcquireServerProtocol.add_pending_messages(client_ids, [[enums.CommandsToClient.SetTileGameBoardType.value, tile_index, new_type]])

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
                    AcquireServerProtocol.add_pending_messages({self.game.score_sheet.player_data[player_id][enums.ScoreSheetIndexes.Client.value].client_id}, [[enums.CommandsToClient.RemoveTile.value, tile_index]])

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
        AcquireServerProtocol.add_pending_messages(client_ids, [[enums.CommandsToClient.SetGameAction.value, self.game_action_id, self.player_id] + self.additional_params])


class ActionStartGame(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions.StartGame.value)

    def execute(self):
        self.game.add_history_message(enums.GameHistoryMessages.StartedGame.value, self.player_id)

        self.game.state = enums.GameStates.InProgress.value
        message = [enums.CommandsToClient.SetGameState.value, self.game.game_id, self.game.state]
        if self.game.mode == enums.GameModes.Teams.value and self.game.num_players < 4:
            self.game.mode = enums.GameModes.Singles.value
            message.append(self.game.mode)
        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [message])

        self.game.tile_racks.draw_initial_tiles()
        self.game.tile_racks.determine_tile_game_board_types()

        return [ActionPlayTile(self.game, 0), ActionPurchaseShares(self.game, 0)]


class ActionPlayTile(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions.PlayTile.value)

    def prepare(self):
        self.game.turn_player_id = self.player_id

        AcquireServerProtocol.add_pending_messages(self.game.client_ids, [[enums.CommandsToClient.SetTurn.value, self.player_id]])
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

        if not has_a_playable_tile:
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
        self.can_end_game = False
        self.end_game = False

    def prepare(self):
        for type_id, chain_size in enumerate(self.game.score_sheet.chain_size):
            if chain_size and not self.game.game_board.board_type_to_coordinates[type_id]:
                self.game.score_sheet.set_chain_size(type_id, 0)

        self.game.tile_racks.determine_tile_game_board_types()

        can_purchase_shares = False
        score_sheet = self.game.score_sheet
        cash = score_sheet.player_data[self.player_id][enums.ScoreSheetIndexes.Cash.value]
        for chain_size, available, price in zip(score_sheet.chain_size, score_sheet.available, score_sheet.price):
            if chain_size and available and price <= cash:
                can_purchase_shares = True
                break

        existing_chain_sizes = [x for x in self.game.score_sheet.chain_size if x]
        self.can_end_game = existing_chain_sizes and (min(existing_chain_sizes) >= 11 or max(existing_chain_sizes) >= 41)

        if not can_purchase_shares and not self.can_end_game:
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
        score_sheet = self.game.score_sheet
        for game_board_type_id, count in game_board_type_id_to_count.items():
            if score_sheet.chain_size[game_board_type_id] and count <= score_sheet.available[game_board_type_id]:
                cost += score_sheet.price[game_board_type_id] * count
            else:
                return
        if cost > score_sheet.player_data[self.player_id][enums.ScoreSheetIndexes.Cash.value]:
            return

        if cost:
            for game_board_type_id, count in game_board_type_id_to_count.items():
                score_sheet.adjust_player_data(self.player_id, game_board_type_id, count)
            score_sheet.adjust_player_data(self.player_id, enums.ScoreSheetIndexes.Cash.value, -cost)

        self.game.add_history_message(enums.GameHistoryMessages.PurchasedShares.value, self.player_id, sorted(game_board_type_id_to_count.items()))

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

            self.game.state = enums.GameStates.Completed.value
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGameState.value, self.game.game_id, self.game.state]])

            return [ActionGameOver(self.game)]
        else:
            self.game.tile_racks.draw_tile(self.player_id)
            self.game.tile_racks.determine_tile_game_board_types([self.player_id])
            self.game.tile_racks.replace_dead_tiles(self.player_id)

            all_tiles_played = self.game.tile_racks.are_racks_empty()
            if all_tiles_played:
                self.game.add_history_message(enums.GameHistoryMessages.AllTilesPlayed.value, None)
                self.game.state = enums.GameStates.Completed.value
                AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGameState.value, self.game.game_id, self.game.state]])
                return [ActionGameOver(self.game)]

            next_player_id = (self.player_id + 1) % self.game.num_players
            return [ActionPlayTile(self.game, next_player_id), ActionPurchaseShares(self.game, next_player_id)]


class ActionGameOver(Action):
    def __init__(self, game):
        super().__init__(game, None, enums.GameActions.GameOver.value)

    def prepare(self):
        self.game.score_sheet.update_net_worths()
        scores = [[player_datum[enums.ScoreSheetIndexes.Username.value], player_datum[enums.ScoreSheetIndexes.Net.value]] for player_datum in self.game.score_sheet.player_data]
        result = ujson.dumps([time.time(), self.game.mode, scores])
        print('result', result)

    def execute(self):
        pass


class Game:
    def __init__(self, game_id, client, mode, max_players):
        self.game_id = game_id
        self.mode = mode
        self.num_players = 0
        self.max_players = max_players if mode == enums.GameModes.Singles.value else 4
        self.client_ids = set()
        self.watcher_client_ids = set()

        self.game_board = GameBoard(self.client_ids)
        self.score_sheet = ScoreSheet(game_id, self.client_ids)
        tiles = [(x, y) for x in range(12) for y in range(9)]
        random.shuffle(tiles)
        self.tile_bag = tiles
        self.tile_racks = TileRacks(self)

        self.state = enums.GameStates.Starting.value
        self.actions = []
        self.turn_player_id = None
        self.turns_without_played_tiles_count = 0
        self.history_messages = []
        self.expiration_time = None

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGameState.value, self.game_id, self.state, self.mode, self.max_players]])

        self.join_game(client)

    def join_game(self, client):
        if self.state == enums.GameStates.Starting.value and not self.score_sheet.is_username_in_game(client.username):
            self.num_players += 1
            self.client_ids.add(client.client_id)
            client.game_id = self.game_id
            position_tile = self.tile_bag.pop()
            self.game_board.set_cell(position_tile, enums.GameBoardTypes.NothingYet.value)
            previous_creator_player_id = self.score_sheet.get_creator_player_id()
            self.score_sheet.add_player(client, position_tile)
            self.send_past_history_messages(client)
            self.add_history_message(enums.GameHistoryMessages.DrewPositionTile.value, client.username, position_tile[0], position_tile[1])
            creator_player_id = self.score_sheet.get_creator_player_id()
            if creator_player_id != previous_creator_player_id:
                del self.actions[:]
                self.actions.append(ActionStartGame(self, creator_player_id))
                self.actions[-1].send_message(self.client_ids)
            else:
                self.actions[-1].send_message({client.client_id})
            if self.num_players == self.max_players:
                self.state = enums.GameStates.StartingFull.value
                AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGameState.value, self.game_id, self.state]])
            self.expiration_time = None

    def rejoin_game(self, client):
        if self.score_sheet.is_username_in_game(client.username):
            self.client_ids.add(client.client_id)
            client.game_id = self.game_id
            self.score_sheet.readd_player(client)
            self.send_initialization_messages(client)
            self.send_past_history_messages(client)
            self.expiration_time = None

    def watch_game(self, client):
        if not self.score_sheet.is_username_in_game(client.username):
            self.client_ids.add(client.client_id)
            self.watcher_client_ids.add(client.client_id)
            client.game_id = self.game_id
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.SetGameWatcherClientId.value, self.game_id, client.client_id]])
            self.send_initialization_messages(client)
            self.send_past_history_messages(client)
            self.expiration_time = None

    def remove_client(self, client):
        if client.client_id in self.client_ids:
            client.game_id = None
            if client.client_id in self.watcher_client_ids:
                self.watcher_client_ids.discard(client.client_id)
                AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient.ReturnWatcherToLobby.value, self.game_id, client.client_id]])
            else:
                self.score_sheet.remove_client(client)
            self.client_ids.discard(client.client_id)
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

    def add_history_message(self, *data, player_id=None):
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
            AcquireServerProtocol.add_pending_messages(client_ids, [message])

    def send_past_history_messages(self, client):
        player_id = client.player_id
        messages = []
        for target_player_id, message in self.history_messages:
            if target_player_id is None:
                include_message = True
            else:
                include_message = player_id is not None and target_player_id == player_id

            if include_message:
                messages.append(message)

        if messages:
            AcquireServerProtocol.add_pending_messages({client.client_id}, [[enums.CommandsToClient.AddGameHistoryMessages.value, messages]])

    def send_initialization_messages(self, client):
        # game board
        messages = [[enums.CommandsToClient.SetGameBoard.value, self.game_board.x_to_y_to_board_type]]

        # score sheet
        score_sheet_data = [
            [x[:enums.ScoreSheetIndexes.Cash.value + 1] for x in self.score_sheet.player_data],
            self.score_sheet.chain_size,
        ]
        messages.append([enums.CommandsToClient.SetScoreSheet.value, score_sheet_data])

        # player's tiles
        if client.player_id is not None and self.tile_racks.racks:
            for tile_index, tile_data in enumerate(self.tile_racks.racks[client.player_id]):
                if tile_data:
                    x, y = tile_data[0]
                    messages.append([enums.CommandsToClient.SetTile.value, tile_index, x, y, tile_data[1]])

        # turn
        messages.append([enums.CommandsToClient.SetTurn.value, self.turn_player_id])

        AcquireServerProtocol.add_pending_messages({client.client_id}, messages)

        # action
        self.actions[-1].send_message({client.client_id})


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    else:
        debug = False

    factory = autobahn.asyncio.websocket.WebSocketServerFactory('ws://127.0.0.1:9000', debug=debug)
    factory.protocol = AcquireServerProtocol

    loop = asyncio.get_event_loop()
    loop.call_soon(AcquireServerProtocol.do_heartbeat_management)
    loop.call_soon(AcquireServerProtocol.destroy_expired_games)
    coro = loop.create_server(factory, '127.0.0.1', 9000)
    server = loop.run_until_complete(coro)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    except:
        traceback.print_exc()
    finally:
        server.close()
        loop.close()
