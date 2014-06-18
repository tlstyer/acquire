import asyncio
import autobahn.asyncio.websocket
import collections
import enums
import random
import sys
import ujson


class ClientManager:
    def __init__(self):
        self.next_client_id = 1
        self.client_id_to_client = {}
        self.usernames = set()
        self.next_game_id = 1
        self.game_id_to_game = {}
        self.pending_messages = []

    def open_client(self, client):
        client_id = self.next_client_id
        self.next_client_id += 1
        client.client_id = client_id
        self.client_id_to_client[client_id] = client
        client_pending_messages = [[enums.CommandsToClient.SetClientId.value, client_id]]

        username = client.username
        if len(username) == 0 or len(username) > 32:
            client_pending_messages.append([enums.CommandsToClient.FatalError.value, enums.FatalErrors.InvalidUsername.value])
            self.pending_messages.append(['client', client_id, client_pending_messages])
            self.flush_pending_messages()
            client.sendClose()
            return
        elif username in self.usernames:
            client_pending_messages.append([enums.CommandsToClient.FatalError.value, enums.FatalErrors.UsernameAlreadyInUse.value])
            self.pending_messages.append(['client', client_id, client_pending_messages])
            self.flush_pending_messages()
            client.sendClose()
            return

        self.usernames.add(username)

        all_pending_messages = []
        enum_set_client_id_to_username = enums.CommandsToClient.SetClientIdToUsername.value

        # tell client about other clients' usernames
        for client2 in self.client_id_to_client.values():
            if client2 is not client:
                client_pending_messages.append([enum_set_client_id_to_username, client2.client_id, client2.username])

        # tell all clients about client's username
        all_pending_messages.append([enum_set_client_id_to_username, client_id, username])

        self.pending_messages.append(['client', client_id, client_pending_messages])
        self.pending_messages.append(['all', None, all_pending_messages])

    def close_client(self, client):
        del self.client_id_to_client[client.client_id]
        self.usernames.discard(client.username)

    def create_game(self, client):
        if client.game_id is None:
            game_id = self.next_game_id
            self.next_game_id += 1

            game = Game(game_id, client.username)
            self.game_id_to_game[game_id] = game

            game.add_player(client)

            self.pending_messages.extend(game.get_messages())

    def flush_pending_messages(self):
        for target, target_id, messages in self.pending_messages:
            messages_json = ujson.dumps(messages)
            messages_json_bytes = messages_json.encode()
            if target == 'all':
                print(target, '<-', messages_json)
                for client in self.client_id_to_client.values():
                    client.sendMessage(messages_json_bytes)
            elif target == 'game':
                print(target, target_id, '<-', messages_json)
            elif target == 'client':
                print(target, target_id, '<-', messages_json)
                self.client_id_to_client[target_id].sendMessage(messages_json_bytes)
            else:
                print('unknown target for messages:', [target, target_id, messages])
        del self.pending_messages[:]


client_manager = ClientManager()


class AcquireServerProtocol(autobahn.asyncio.websocket.WebSocketServerProtocol):
    def __init__(self):
        self.username = None
        self.client_id = None
        self.game_id = None
        self.player_id = None

    def onConnect(self, request):
        self.username = ' '.join(request.params.get('username', [''])[0].split())
        print('X', 'connect', self.peer, self.username)
        print()

    def onOpen(self):
        super().onOpen()
        client_manager.open_client(self)
        print(self.client_id, 'open', self.peer)
        client_manager.flush_pending_messages()
        print()

    def onClose(self, wasClean, code, reason):
        super().onClose(wasClean, code, reason)
        print(self.client_id, 'close')
        client_manager.close_client(self)
        client_manager.flush_pending_messages()
        print()

    def onMessage(self, payload, isBinary):
        super().onMessage(payload, isBinary)
        if not isBinary:
            try:
                message = payload.decode()
                print(self.client_id, '->', message)
                message = ujson.decode(message)
                method = getattr(self, 'onMessage' + enums.CommandsToServer(message[0]).name)
                arguments = message[1:]
            except Exception as e:
                print(e)
                self.sendClose()
                return

            try:
                method(*arguments)
                client_manager.flush_pending_messages()
                print()
            except TypeError as e:
                print(e)
                self.sendClose()
        else:
            self.sendClose()

    def onMessageCreateGame(self):
        client_manager.create_game(self)


class GameBoard:
    def __init__(self):
        nothing = enums.BoardTypes.Nothing.value
        self.x_to_y_to_board_type = [[nothing for y in range(0, 9)] for x in range(0, 12)]
        self.board_type_to_coordinates = collections.defaultdict(set)
        self.board_type_to_coordinates[nothing].update((x, y) for x in range(0, 12) for y in range(0, 9))

        self.messages_game = []

    def set_cell(self, coordinates, board_type):
        x, y = coordinates
        old_board_type = self.x_to_y_to_board_type[x][y]
        self.board_type_to_coordinates[old_board_type].remove(coordinates)
        self.x_to_y_to_board_type[x][y] = board_type
        self.board_type_to_coordinates[board_type].add(coordinates)
        self.messages_game.append([x, y, board_type])


class ScoreSheet:
    def __init__(self, game_id):
        self.game_id = game_id

        self.player_data = []
        self.available = [25, 25, 25, 25, 25, 25, 25]
        self.chain_size = [0, 0, 0, 0, 0, 0, 0]
        self.price = [0, 0, 0, 0, 0, 0, 0]

        self.messages_all = []
        self.messages_game = []

    def add_player(self, client, starting_tile):
        self.player_data.append([0, 0, 0, 0, 0, 0, 0, 6000, 6000, client.username, starting_tile, client])
        self.player_data.sort(key=lambda x: x[enums.ScoreSheetPlayerIndexes.StartingTile.value])

        client_index = enums.ScoreSheetPlayerIndexes.Client.value
        username_index = enums.ScoreSheetPlayerIndexes.Username.value
        set_game_player_username = enums.CommandsToClient.SetGamePlayerUsername.value
        set_game_player_client_id = enums.CommandsToClient.SetGamePlayerClientId.value

        correct_player_id = 0
        for player_id, player_datum in enumerate(self.player_data):
            if player_datum[client_index] is not None:
                player_datum[client_index].player_id = correct_player_id
            correct_player_id += 1

        for player_id in range(client.player_id, len(self.player_data)):
            player_datum = self.player_data[player_id]
            if player_datum[client_index] is None:
                self.messages_all.append([set_game_player_username, self.game_id, player_id, player_datum[username_index]])
            else:
                self.messages_all.append([set_game_player_client_id, self.game_id, player_id, player_datum[client_index].client_id])


class TileBag:
    def __init__(self):
        tiles = [(x, y) for x in range(0, 12) for y in range(0, 9)]
        random.shuffle(tiles)
        self.tiles = tiles

    def get_tile(self):
        if len(self.tiles) > 0:
            return self.tiles.pop()
        else:
            return None

    def __len__(self):
        return len(self.tiles)


class Game:
    def __init__(self, game_id, creator_username):
        self.game_id = game_id
        self.creator_username = creator_username

        self.game_board = GameBoard()
        self.score_sheet = ScoreSheet(game_id)
        self.tile_bag = TileBag()

        self.state = enums.GameStates.PreGame.value

        self.messages_all = []
        self.client_id_to_messages = collections.defaultdict(list)

    def add_player(self, client):
        if self.state == enums.GameStates.PreGame.value:
            client.game_id = self.game_id
            starting_tile = self.tile_bag.get_tile()
            self.game_board.set_cell(starting_tile, enums.BoardTypes.NothingYet.value)
            self.score_sheet.add_player(client, starting_tile)
            self.messages_all.append([enums.CommandsToClient.CreateGame.value, self.game_id])
        else:
            pass

    def get_messages(self):
        messages = []

        m = self.messages_all + self.score_sheet.messages_all
        if len(m) > 0:
            messages.append(['all', None, m])

        m = self.game_board.messages_game + self.score_sheet.messages_game
        if len(m) > 0:
            messages.append(['game', self.game_id, m])

        for client_id, m_c in self.client_id_to_messages.items():
            messages.append(['client', client_id, m_c])

        del self.game_board.messages_game[:]
        del self.score_sheet.messages_all[:]
        del self.score_sheet.messages_game[:]
        del self.messages_all[:]
        self.client_id_to_messages.clear()

        return messages


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
    finally:
        server.close()
        loop.close()
