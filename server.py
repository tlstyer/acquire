import asyncio
import autobahn.asyncio.websocket
import collections
import enums
import random
import sys
import traceback
import ujson


class AcquireServerProtocol(autobahn.asyncio.websocket.WebSocketServerProtocol):
    next_client_id = 1
    client_id_to_client = {}
    client_ids = set()
    usernames = set()
    next_game_id = 1
    game_id_to_game = {}
    client_ids_and_messages = []

    def __init__(self):
        self.username = ''
        self.client_id = None
        self.game_id = None
        self.player_id = None

        self.on_message_lookup = []
        for command_enum in enums.CommandsToServer:
            self.on_message_lookup.append(getattr(self, 'onMessage' + command_enum.name))

    def onConnect(self, request):
        self.username = ' '.join(request.params.get('username', [''])[0].split())
        print('X', 'connect', self.peer, self.username)
        print()

    def onOpen(self):
        self.client_id = AcquireServerProtocol.next_client_id
        AcquireServerProtocol.next_client_id += 1
        AcquireServerProtocol.client_id_to_client[self.client_id] = self
        AcquireServerProtocol.client_ids.add(self.client_id)
        messages_client = [[enums.CommandsToClient_SetClientId, self.client_id]]

        print(self.client_id, 'open', self.peer)

        if len(self.username) == 0 or len(self.username) > 32:
            messages_client.append([enums.CommandsToClient_FatalError, enums.FatalErrors_InvalidUsername])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            self.flush_pending_messages()
            self.sendClose()
        elif self.username in AcquireServerProtocol.usernames:
            messages_client.append([enums.CommandsToClient_FatalError, enums.FatalErrors_UsernameAlreadyInUse])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            self.flush_pending_messages()
            self.sendClose()
        else:
            AcquireServerProtocol.usernames.add(self.username)

            # tell client about other clients' data
            for client in AcquireServerProtocol.client_id_to_client.values():
                if client is not self:
                    messages_client.append([enums.CommandsToClient_SetClientIdToData, client.client_id, client.username, client.peer])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)
            messages_client = []

            # tell all clients about client's data
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_SetClientIdToData, self.client_id, self.username, self.peer]])

            # tell client about all games
            for game_id, game in AcquireServerProtocol.game_id_to_game.items():
                messages_client.append([enums.CommandsToClient_SetGameState, game_id, game.state])
                for player_id, player_datum in enumerate(game.score_sheet.player_data):
                    if player_datum[enums.ScoreSheetIndexes_Client] is None:
                        messages_client.append([enums.CommandsToClient_SetGamePlayerUsername, game_id, player_id, player_datum[enums.ScoreSheetIndexes_Username]])
                    else:
                        messages_client.append([enums.CommandsToClient_SetGamePlayerClientId, game_id, player_id, player_datum[enums.ScoreSheetIndexes_Client].client_id])
                for client_id in game.watcher_client_ids:
                    messages_client.append([enums.CommandsToClient_SetGameWatcherClientId, game_id, client_id])
            AcquireServerProtocol.add_pending_messages({self.client_id}, messages_client)

            self.flush_pending_messages()

    def onClose(self, wasClean, code, reason):
        print(self.client_id, 'close')

        if self.game_id is not None:
            AcquireServerProtocol.game_id_to_game[self.game_id].remove_client(self)

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_SetClientIdToData, self.client_id, None, None]])
        self.flush_pending_messages()

        del AcquireServerProtocol.client_id_to_client[self.client_id]
        AcquireServerProtocol.client_ids.discard(self.client_id)
        AcquireServerProtocol.usernames.discard(self.username)

    def onMessage(self, payload, isBinary):
        if not isBinary:
            try:
                message = payload.decode()
                print(self.client_id, '->', message)
                message = ujson.decode(message)
                method = self.on_message_lookup[message[0]]
                arguments = message[1:]
            except:
                traceback.print_exc()
                self.sendClose()
                return

            try:
                method(*arguments)
                self.flush_pending_messages()
            except TypeError:
                traceback.print_exc()
                self.sendClose()
        else:
            self.sendClose()

    def onMessageCreateGame(self):
        if self.game_id is None:
            AcquireServerProtocol.game_id_to_game[AcquireServerProtocol.next_game_id] = Game(AcquireServerProtocol.next_game_id, self)
            AcquireServerProtocol.next_game_id += 1

    def onMessageJoinGame(self, game_id):
        if self.game_id is None and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].join_game(self)

    def onMessageRejoinGame(self, game_id):
        if self.game_id is None and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].rejoin_game(self)

    def onMessageWatchGame(self, game_id):
        if self.game_id is None and game_id in AcquireServerProtocol.game_id_to_game:
            AcquireServerProtocol.game_id_to_game[game_id].watch_game(self)

    def onMessageLeaveGame(self):
        if self.game_id is not None:
            AcquireServerProtocol.game_id_to_game[self.game_id].remove_client(self)

    def onMessageDoGameAction(self, game_action_id, *data):
        if self.game_id is not None:
            AcquireServerProtocol.game_id_to_game[self.game_id].do_game_action(self, game_action_id, data)

    @staticmethod
    def add_pending_messages(client_ids, messages):
        client_ids = client_ids.copy()
        new_list = []
        for client_ids2, messages2 in AcquireServerProtocol.client_ids_and_messages:
            client_ids_in_group = client_ids2 & client_ids
            if len(client_ids_in_group) == len(client_ids2):
                messages2.extend(messages)
                new_list.append([client_ids2, messages2])
            elif len(client_ids_in_group) > 0:
                new_list.append([client_ids_in_group, messages2 + messages])
                client_ids2 -= client_ids_in_group
                new_list.append([client_ids2, messages2])
            else:
                new_list.append([client_ids2, messages2])
            client_ids -= client_ids_in_group
        if len(client_ids) > 0:
            new_list.append([client_ids, messages])
        AcquireServerProtocol.client_ids_and_messages = new_list

    @staticmethod
    def flush_pending_messages():
        for client_ids, messages in AcquireServerProtocol.client_ids_and_messages:
            messages_json = ujson.dumps(messages)
            print(','.join(str(x) for x in sorted(client_ids)), '<-', messages_json)
            messages_json_bytes = messages_json.encode()
            for client_id in client_ids:
                AcquireServerProtocol.client_id_to_client[client_id].sendMessage(messages_json_bytes)
        del AcquireServerProtocol.client_ids_and_messages[:]
        print()


class GameBoard:
    def __init__(self, client_ids):
        self.client_ids = client_ids

        self.x_to_y_to_board_type = [[enums.GameBoardTypes_Nothing for y in range(9)] for x in range(12)]
        self.board_type_to_coordinates = collections.defaultdict(set)
        self.board_type_to_coordinates[enums.GameBoardTypes_Nothing].update((x, y) for x in range(12) for y in range(9))

    def set_cell(self, coordinates, board_type):
        x, y = coordinates
        old_board_type = self.x_to_y_to_board_type[x][y]
        self.board_type_to_coordinates[old_board_type].remove(coordinates)
        self.x_to_y_to_board_type[x][y] = board_type
        self.board_type_to_coordinates[board_type].add(coordinates)
        AcquireServerProtocol.add_pending_messages(self.client_ids, [[enums.CommandsToClient_SetGameBoardCell, x, y, board_type]])

    def fill_cells(self, coordinates, board_type):
        pending = [coordinates]
        found = {coordinates}
        messages = []
        excluded_board_types = {enums.GameBoardTypes_Nothing, enums.GameBoardTypes_CantPlayEver, board_type}

        while len(pending) > 0:
            new_pending = []
            for coords in pending:
                x, y = coords
                old_board_type = self.x_to_y_to_board_type[x][y]
                self.board_type_to_coordinates[old_board_type].remove(coords)
                self.x_to_y_to_board_type[x][y] = board_type
                self.board_type_to_coordinates[board_type].add(coords)
                messages.append([enums.CommandsToClient_SetGameBoardCell, x, y, board_type])

                possibilities = []
                if x > 0:
                    possibilities.append((x - 1, y))
                if x < 11:
                    possibilities.append((x + 1, y))
                if y > 0:
                    possibilities.append((x, y - 1))
                if y < 8:
                    possibilities.append((x, y + 1))

                for coords2 in possibilities:
                    if coords2 not in found and self.x_to_y_to_board_type[coords2[0]][coords2[1]] not in excluded_board_types:
                        found.add(coords2)
                        new_pending.append(coords2)

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

    def add_player(self, client, position_tile):
        messages_all = []
        messages_client = []

        self.player_data.append([0, 0, 0, 0, 0, 0, 0, 60, 60, client.username, position_tile, client, len(self.player_data) == 0])
        self.player_data.sort(key=lambda x: x[enums.ScoreSheetIndexes_PositionTile])

        # update player_ids for all clients in game
        player_id = 0
        for player_datum in self.player_data:
            if player_datum[enums.ScoreSheetIndexes_Client] is not None:
                player_datum[enums.ScoreSheetIndexes_Client].player_id = player_id
            player_id += 1

        for player_id, player_datum in enumerate(self.player_data):
            # tell everybody about player changes
            player_datum = self.player_data[player_id]
            if player_id >= client.player_id:
                if player_datum[enums.ScoreSheetIndexes_Client] is None:
                    messages_all.append([enums.CommandsToClient_SetGamePlayerUsername, self.game_id, player_id, player_datum[enums.ScoreSheetIndexes_Username]])
                else:
                    messages_all.append([enums.CommandsToClient_SetGamePlayerClientId, self.game_id, player_id, player_datum[enums.ScoreSheetIndexes_Client].client_id])

            # tell client about other position tiles
            if player_id != client.player_id:
                position_tile = player_datum[enums.ScoreSheetIndexes_PositionTile]
                messages_client.append([enums.CommandsToClient_SetGameBoardCell, position_tile[0], position_tile[1], enums.GameBoardTypes_NothingYet])

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, messages_all)
        if len(messages_client) > 0:
            AcquireServerProtocol.add_pending_messages({client.client_id}, messages_client)

    def readd_player(self, client):
        messages_all = []

        for player_id, player_datum in enumerate(self.player_data):
            if client.username == player_datum[enums.ScoreSheetIndexes_Username]:
                client.player_id = player_id
                player_datum[enums.ScoreSheetIndexes_Client] = client
                messages_all.append([enums.CommandsToClient_SetGamePlayerClientId, self.game_id, player_id, client.client_id])

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, messages_all)

    def remove_client(self, client):
        messages_all = []

        for player_id, player_datum in enumerate(self.player_data):
            if client is player_datum[enums.ScoreSheetIndexes_Client]:
                player_datum[enums.ScoreSheetIndexes_Client].player_id = None
                player_datum[enums.ScoreSheetIndexes_Client] = None
                messages_all.append([enums.CommandsToClient_SetGamePlayerClientId, self.game_id, player_id, None])

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, messages_all)

    def is_username_in_game(self, username):
        for player_datum in self.player_data:
            if username == player_datum[enums.ScoreSheetIndexes_Username]:
                return True
        return False

    def get_creator_player_id(self):
        for player_id, player_datum in enumerate(self.player_data):
            if player_datum[enums.ScoreSheetIndexes_IsCreator]:
                return player_id

    def get_player_id_to_client_id(self):
        player_id_to_client_id = []

        for player_datum in self.player_data:
            client = player_datum[enums.ScoreSheetIndexes_Client]
            player_id_to_client_id.append(None if client is None else client.client_id)

        return player_id_to_client_id

    def set_chain_size(self, game_board_type_id, chain_size):
        messages = []

        self.chain_size[game_board_type_id] = chain_size
        messages.append([enums.CommandsToClient_SetScoreSheetCell, enums.ScoreSheetRows_ChainSize, game_board_type_id, chain_size])

        old_price = self.price[game_board_type_id]
        if chain_size > 0:
            if chain_size < 11:
                new_price = min(chain_size, 6)
            else:
                new_price = min((chain_size - 1) // 10 + 6, 10)
            if game_board_type_id >= enums.GameBoardTypes_American:
                new_price += 1
            if game_board_type_id >= enums.GameBoardTypes_Continental:
                new_price += 1
        else:
            new_price = 0
        if new_price != old_price:
            self.price[game_board_type_id] = new_price
            messages.append([enums.CommandsToClient_SetScoreSheetCell, enums.ScoreSheetRows_Price, game_board_type_id, new_price])

        AcquireServerProtocol.add_pending_messages(self.client_ids, messages)


class TileBag:
    def __init__(self):
        tiles = [(x, y) for x in range(12) for y in range(9)]
        random.shuffle(tiles)
        self.tiles = tiles

    def get_tile(self):
        if len(self.tiles) > 0:
            return self.tiles.pop()
        else:
            return None

    def __len__(self):
        return len(self.tiles)


class TileRacks:
    def __init__(self, game):
        self.game = game
        self.racks = []

    def draw_initial_tiles(self):
        for player_id in range(len(self.game.player_id_to_client_id)):
            self.racks.append([None, None, None, None, None, None])
            self.draw_tile(player_id)

    def remove_tile(self, player_id, tile_index):
        self.racks[player_id][tile_index] = None

    def draw_tile(self, player_id):
        tile_data = self.racks[player_id]

        for tile_index, tile_datum in enumerate(tile_data):
            if tile_datum is None:
                tile = self.game.tile_bag.get_tile()
                if tile is not None:
                    tile_data[tile_index] = [tile, None]

    def determine_tile_game_board_types(self):
        chain_sizes = self.game.score_sheet.chain_size
        can_start_new_chain = 0 in chain_sizes
        x_to_y_to_board_type = self.game.game_board.x_to_y_to_board_type

        for player_id, rack in enumerate(self.racks):
            old_types = [None if t is None else t[1] for t in rack]
            new_types = []
            for tile_datum in rack:
                if tile_datum is None:
                    new_type = None
                else:
                    tile = tile_datum[0]
                    x = tile[0]
                    y = tile[1]

                    borders = set()
                    if x > 0:
                        borders.add(x_to_y_to_board_type[x - 1][y])
                    if x < 11:
                        borders.add(x_to_y_to_board_type[x + 1][y])
                    if y > 0:
                        borders.add(x_to_y_to_board_type[x][y - 1])
                    if y < 8:
                        borders.add(x_to_y_to_board_type[x][y + 1])
                    borders.discard(enums.GameBoardTypes_Nothing)
                    borders.discard(enums.GameBoardTypes_CantPlayEver)
                    if len(borders) > 1 and enums.GameBoardTypes_NothingYet in borders:
                        borders.remove(enums.GameBoardTypes_NothingYet)

                    len_borders = len(borders)
                    new_type = enums.GameBoardTypes_WillPutLonelyTileDown
                    if len_borders == 1:
                        if enums.GameBoardTypes_NothingYet in borders:
                            if can_start_new_chain:
                                new_type = enums.GameBoardTypes_WillFormNewChain
                            else:
                                new_type = enums.GameBoardTypes_CantPlayNow
                        else:
                            for t in borders:
                                new_type = t
                    elif len_borders > 1:
                        new_type = enums.GameBoardTypes_CantPlayEver

                new_types.append(new_type)

            for tile_index, tile_datum in enumerate(rack):
                if tile_datum is not None:
                    tile_datum[1] = new_types[tile_index]

            messages = []
            for tile_index, old_type in enumerate(old_types):
                new_type = new_types[tile_index]
                if new_type != old_type:
                    if old_type is None:
                        tile = rack[tile_index][0]
                        messages.append([enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_DrewTile, player_id, tile[0], tile[1]])
                        messages.append([enums.CommandsToClient_SetTile, tile_index, tile[0], tile[1], new_type])
                    else:
                        messages.append([enums.CommandsToClient_SetTileGameBoardType, tile_index, new_type])

            if len(messages) > 0:
                client_id = self.game.player_id_to_client_id[player_id]
                if client_id is not None:
                    AcquireServerProtocol.add_pending_messages({client_id}, messages)


class Action:
    def __init__(self, game, player_id, game_action_id):
        self.game = game
        self.player_id = player_id
        self.game_action_id = game_action_id
        self.player_params = []
        self.other_params = []

    def prepare(self):
        pass

    def send_message(self, client=None):
        target_client_ids = self.game.client_ids if client is None else {client.client_id}
        message = [enums.CommandsToClient_SetGameAction, self.game_action_id, self.player_id]

        if len(self.player_params) == 0 and len(self.other_params) == 0:
            AcquireServerProtocol.add_pending_messages(target_client_ids, [message])
        else:
            player_client_ids = target_client_ids & {self.game.player_id_to_client_id[self.player_id]}
            other_client_ids = target_client_ids - player_client_ids

            if len(player_client_ids) > 0:
                AcquireServerProtocol.add_pending_messages(player_client_ids, [message + self.player_params])
            if len(other_client_ids) > 0:
                AcquireServerProtocol.add_pending_messages(other_client_ids, [message + self.other_params])


class ActionStartGame(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions_StartGame)

    def execute(self):
        AcquireServerProtocol.add_pending_messages(self.game.client_ids, [[enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_StartedGame, self.player_id]])

        self.game.state = enums.GameStates_InProgress
        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_SetGameState, self.game.game_id, self.game.state]])

        self.game.tile_racks.draw_initial_tiles()
        self.game.tile_racks.determine_tile_game_board_types()

        return [ActionPlayTile(self.game, 0), ActionPurchaseStock(self.game, 0)]


class ActionPlayTile(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions_PlayTile)

    def prepare(self):
        message = [enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_TurnBegan, self.player_id]
        AcquireServerProtocol.add_pending_messages(self.game.client_ids, [message])

    def execute(self, tile_index):
        if not isinstance(tile_index, int):
            return
        tile_data = self.game.tile_racks.racks[self.player_id]
        if tile_index < 0 or tile_index >= len(tile_data):
            return
        tile_datum = tile_data[tile_index]
        if tile_datum is None:
            return

        tile = tile_datum[0]
        game_board_type_id = tile_datum[1]
        retval = True

        if game_board_type_id <= enums.GameBoardTypes_Imperial:
            self.game.game_board.fill_cells(tile, game_board_type_id)
            self.game.score_sheet.set_chain_size(game_board_type_id, len(self.game.game_board.board_type_to_coordinates[game_board_type_id]))
        elif game_board_type_id == enums.GameBoardTypes_WillPutLonelyTileDown:
            self.game.game_board.set_cell(tile, enums.GameBoardTypes_NothingYet)
        elif game_board_type_id == enums.GameBoardTypes_WillFormNewChain:
            self.game.game_board.set_cell(tile, enums.GameBoardTypes_NothingYet)
            retval = [ActionSelectNewChain(self.game, self.player_id, [index for index, size in enumerate(self.game.score_sheet.chain_size) if size == 0], tile)]
        else:
            return

        self.game.tile_racks.remove_tile(self.player_id, tile_index)

        message = [enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_PlayedTile, self.player_id, tile[0], tile[1]]
        AcquireServerProtocol.add_pending_messages(self.game.client_ids, [message])

        return retval


class ActionSelectNewChain(Action):
    def __init__(self, game, player_id, game_board_type_ids, tile):
        super().__init__(game, player_id, enums.GameActions_SelectNewChain)
        self.game_board_type_ids = game_board_type_ids
        self.player_params.append(game_board_type_ids)
        self.tile = tile

    def prepare(self):
        if len(self.game_board_type_ids) == 1:
            return self._create_new_chain(self.game_board_type_ids[0])

    def execute(self, game_board_type_id):
        if game_board_type_id in self.game_board_type_ids:
            return self._create_new_chain(game_board_type_id)

    def _create_new_chain(self, game_board_type_id):
        self.game.game_board.fill_cells(self.tile, game_board_type_id)
        self.game.score_sheet.set_chain_size(game_board_type_id, len(self.game.game_board.board_type_to_coordinates[game_board_type_id]))
        return True


class ActionPurchaseStock(Action):
    def __init__(self, game, player_id):
        super().__init__(game, player_id, enums.GameActions_PurchaseStock)

    def prepare(self):
        self.game.tile_racks.draw_tile(self.player_id)
        self.game.tile_racks.determine_tile_game_board_types()

        next_player_id = (self.player_id + 1) % len(self.game.player_id_to_client_id)
        return [ActionPlayTile(self.game, next_player_id), ActionPurchaseStock(self.game, next_player_id)]

    def execute(self):
        pass


class Game:
    def __init__(self, game_id, client):
        self.game_id = game_id
        self.client_ids = set()
        self.watcher_client_ids = set()

        self.game_board = GameBoard(self.client_ids)
        self.score_sheet = ScoreSheet(game_id, self.client_ids)
        self.tile_bag = TileBag()
        self.tile_racks = TileRacks(self)

        self.state = enums.GameStates_Starting
        self.actions = collections.deque()

        AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_SetGameState, self.game_id, self.state]])

        self.client_ids.add(client.client_id)
        client.game_id = self.game_id
        position_tile = self.tile_bag.get_tile()
        self.game_board.set_cell(position_tile, enums.GameBoardTypes_NothingYet)
        self.score_sheet.add_player(client, position_tile)
        self.player_id_to_client_id = self.score_sheet.get_player_id_to_client_id()
        message = [enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_DrewPositionTile, client.player_id, position_tile[0], position_tile[1]]
        AcquireServerProtocol.add_pending_messages(self.client_ids, [message])
        self.actions.append(ActionStartGame(self, self.score_sheet.get_creator_player_id()))
        self.actions[0].send_message()

    def join_game(self, client):
        if self.state == enums.GameStates_Starting and not self.score_sheet.is_username_in_game(client.username):
            self.client_ids.add(client.client_id)
            client.game_id = self.game_id
            position_tile = self.tile_bag.get_tile()
            self.game_board.set_cell(position_tile, enums.GameBoardTypes_NothingYet)
            previous_creator_player_id = self.score_sheet.get_creator_player_id()
            self.score_sheet.add_player(client, position_tile)
            self.player_id_to_client_id = self.score_sheet.get_player_id_to_client_id()
            message = [enums.CommandsToClient_AddGameHistoryMessage, enums.GameHistoryMessages_DrewPositionTile, client.player_id, position_tile[0], position_tile[1]]
            AcquireServerProtocol.add_pending_messages(self.client_ids, [message])
            creator_player_id = self.score_sheet.get_creator_player_id()
            if creator_player_id != previous_creator_player_id:
                self.actions.clear()
                self.actions.append(ActionStartGame(self, creator_player_id))
                self.actions[0].send_message()
            else:
                self.actions[0].send_message(client)

    def rejoin_game(self, client):
        if self.score_sheet.is_username_in_game(client.username):
            self.client_ids.add(client.client_id)
            client.game_id = self.game_id
            self.score_sheet.readd_player(client)
            self.player_id_to_client_id = self.score_sheet.get_player_id_to_client_id()
            self.send_initialization_messages(client)

    def watch_game(self, client):
        if not self.score_sheet.is_username_in_game(client.username):
            self.client_ids.add(client.client_id)
            self.watcher_client_ids.add(client.client_id)
            client.game_id = self.game_id
            AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_SetGameWatcherClientId, self.game_id, client.client_id]])
            self.send_initialization_messages(client)

    def remove_client(self, client):
        if client.client_id in self.client_ids:
            client.game_id = None
            if client.client_id in self.watcher_client_ids:
                self.watcher_client_ids.discard(client.client_id)
                AcquireServerProtocol.add_pending_messages(AcquireServerProtocol.client_ids, [[enums.CommandsToClient_ReturnWatcherToLobby, self.game_id, client.client_id]])
            self.score_sheet.remove_client(client)
            self.player_id_to_client_id = self.score_sheet.get_player_id_to_client_id()
            self.client_ids.discard(client.client_id)

    def do_game_action(self, client, game_action_id, data):
        action = self.actions[0]
        if client.player_id is not None and client.player_id == action.player_id and game_action_id == action.game_action_id:
            new_actions = action.execute(*data)
            while new_actions:
                self.actions.popleft()
                if isinstance(new_actions, list):
                    new_actions.reverse()
                    self.actions.extendleft(new_actions)
                action = self.actions[0]
                new_actions = action.prepare()
            action.send_message()

    def send_initialization_messages(self, client):
        # game board
        messages = [[enums.CommandsToClient_SetGameBoard, self.game_board.x_to_y_to_board_type]]

        # score sheet
        score_sheet_data = [
            [x[:enums.ScoreSheetIndexes_Net + 1] for x in self.score_sheet.player_data],
            self.score_sheet.available,
            self.score_sheet.chain_size,
            self.score_sheet.price,
        ]
        messages.append([enums.CommandsToClient_SetScoreSheet, score_sheet_data])

        # player's tiles
        if client.player_id is not None:
            for tile_index, tile_datum in enumerate(self.tile_racks.racks[client.player_id]):
                if tile_datum is not None:
                    tile = tile_datum[0]
                    messages.append([enums.CommandsToClient_SetTile, tile_index, tile[0], tile[1], tile_datum[1]])

        AcquireServerProtocol.add_pending_messages({client.client_id}, messages)

        # action
        self.actions[0].send_message(client)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    else:
        debug = False

    factory = autobahn.asyncio.websocket.WebSocketServerFactory('ws://127.0.0.1:9000', debug=debug)
    factory.protocol = AcquireServerProtocol

    loop = asyncio.get_event_loop()
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
