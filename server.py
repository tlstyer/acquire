import ujson
import sys
import random
import collections
import asyncio
from autobahn.asyncio.websocket import WebSocketServerFactory, WebSocketServerProtocol
import enums


class ClientManager:
    next_client_id = 1
    next_game_id = 1
    peer_to_client_id = {}
    peer_to_client = {}
    peer_to_username = {}
    usernames = set()
    peer_to_game_id = {}
    game_id_to_peers = collections.defaultdict(set)
    peer_to_messages = collections.defaultdict(list)

    def add_client(self, client):
        self.peer_to_client_id[client.peer] = self.next_client_id
        self.next_client_id += 1
        self.peer_to_client[client.peer] = client
        self.peer_to_username[client.peer] = None
        self.peer_to_messages[client.peer].append([enums.CommandsToClient.SetClientId.value, self.peer_to_client_id[client.peer]])

    def remove_client(self, client):
        self._change_game_id(client.peer, None)
        del self.peer_to_client_id[client.peer]
        del self.peer_to_client[client.peer]
        self.usernames.discard(self.peer_to_username[client.peer])
        del self.peer_to_username[client.peer]

    def set_username(self, client, username):
        # todo: assert user didn't set their username already
        username = ' '.join(username.split())
        if len(username) == 0 or len(username) > 32:
            # todo: tell user that username is too short or too long
            client.sendClose()
        elif username in self.usernames:
            # todo: tell user that username is taken
            client.sendClose()
        else:
            self.peer_to_username[client.peer] = username
            self.usernames.add(username)

            self._change_game_id(client.peer, 0)

    def create_game(self, client):
        if self.peer_to_game_id.get(client.peer, None) == 0:
            game_id = self.next_game_id
            self.next_game_id += 1

            enum_create_game = enums.CommandsToClient.CreateGame.value

            for peer in self.peer_to_game_id.keys():
                self.peer_to_messages[peer].append([enum_create_game, game_id])

            self._change_game_id(client.peer, game_id)

    def _change_game_id(self, peer, game_id):
        # leave current game
        current_game_id = self.peer_to_game_id.get(peer, None)
        if current_game_id is not None:
            del self.peer_to_game_id[peer]
            self.game_id_to_peers[current_game_id].remove(peer)

        # enter new game
        if game_id is not None:
            self.peer_to_game_id[peer] = game_id
            self.game_id_to_peers[game_id].add(peer)

        # tell clients about this change. also, tell clients about username changes, if applicable.
        enum_create_game = enums.CommandsToClient.CreateGame.value
        enum_set_client_id_to_username = enums.CommandsToClient.SetClientIdToUsername.value
        enum_set_client_id_to_game_id = enums.CommandsToClient.SetClientIdToGameId.value
        client_id = self.peer_to_client_id[peer]
        username = self.peer_to_username[peer]

        if current_game_id is None and game_id is not None:
            for game_id2 in self.game_id_to_peers.keys():
                if game_id2 != 0:
                    self.peer_to_messages[peer].append([enum_create_game, game_id2])
            for peer2, game_id2 in self.peer_to_game_id.items():
                if peer2 != peer:
                    self.peer_to_messages[peer].append([enum_set_client_id_to_username, self.peer_to_client_id[peer2], self.peer_to_username[peer2]])
                    self.peer_to_messages[peer].append([enum_set_client_id_to_game_id, self.peer_to_client_id[peer2], game_id2])
                self.peer_to_messages[peer2].append([enum_set_client_id_to_username, client_id, username])

        if current_game_id is not None or game_id is not None:
            for peer2 in self.peer_to_game_id.keys():
                self.peer_to_messages[peer2].append([enum_set_client_id_to_game_id, client_id, game_id])

        if current_game_id is not None and game_id is None:
            for peer2 in self.peer_to_game_id.keys():
                self.peer_to_messages[peer2].append([enum_set_client_id_to_username, client_id, None])

    def flush_peer_to_messages(self):
        for peer, messages in self.peer_to_messages.items():
            messages_json = ujson.dumps(messages)
            print(peer, '->', messages_json)
            messages_json_bytes = messages_json.encode()
            self.peer_to_client[peer].sendMessage(messages_json_bytes)
        print()

        self.peer_to_messages.clear()


client_manager = ClientManager()


class AcquireServerProtocol(WebSocketServerProtocol):
    def onOpen(self):
        super().onOpen()
        print(self.peer, 'connected')
        client_manager.add_client(self)
        client_manager.flush_peer_to_messages()

    def onClose(self, wasClean, code, reason):
        super().onClose(wasClean, code, reason)
        print(self.peer, 'disconnected')
        client_manager.remove_client(self)
        client_manager.flush_peer_to_messages()

    def onMessage(self, payload, isBinary):
        super().onMessage(payload, isBinary)
        if not isBinary:
            try:
                message = payload.decode()
                print(self.peer, '<-', message)
                message = ujson.decode(message)
                method = getattr(self, 'onMessage' + enums.CommandsToServer(message[0]).name)
                arguments = message[1:]
            except Exception as e:
                print(e)
                self.sendClose()
                return

            try:
                method(*arguments)
                client_manager.flush_peer_to_messages()
            except TypeError as e:
                print(e)
                self.sendClose()
        else:
            self.sendClose()

    def onMessageSetUsername(self, username):
        client_manager.set_username(self, username)

    def onMessageCreateGame(self):
        client_manager.create_game(self)


class GameBoard:
    x_to_y_to_board_type = None
    board_type_to_coordinates = None

    def __init__(self):
        self.x_to_y_to_board_type = [['none' for y in range(0, 9)] for x in range(0, 12)]
        self.board_type_to_coordinates = {'none': set((x, y) for x in range(0, 12) for y in range(0, 9))}

    def set_cell(self, coordinates, board_type):
        old_board_type = self.x_to_y_to_board_type[coordinates[0]][coordinates[1]]
        self.board_type_to_coordinates[old_board_type].remove(coordinates)
        self.x_to_y_to_board_type[coordinates[0]][coordinates[1]] = board_type
        if board_type not in self.board_type_to_coordinates:
            self.board_type_to_coordinates[board_type] = set()
        self.board_type_to_coordinates[board_type].add(coordinates)


class TileBag:
    tiles = None

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
    game_board = GameBoard()
    tile_bag = TileBag()

    def __init__(self):
        pass


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    else:
        debug = False

    factory = WebSocketServerFactory('ws://127.0.0.1:9000', debug=debug)
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
