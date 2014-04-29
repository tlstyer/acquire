import json
import sys
import random
import asyncio
from autobahn.asyncio.websocket import WebSocketServerFactory, WebSocketServerProtocol


json_encoder = json.JSONEncoder(separators=(',', ':'))
json_decoder = json.JSONDecoder()
clients = {}

board_types = [
    'luxor',
    'tower',
    'american',
    'festival',
    'worldwide',
    'continental',
    'imperial',
    'nothing-yet',
    'cant-play-ever',
    'i-have-this',
]

random_game = None


class AcquireServerProtocol(WebSocketServerProtocol):
    def onOpen(self):
        print('connected:', self.peer)
        clients[self.peer] = self
        self.sendMessage(json_encoder.encode([['set-board', random_game.game_board.row_to_col_to_board_type]]).encode('utf-8'))

    def onClose(self, wasClean, code, reason):
        print('disconnected:', self.peer)
        del clients[self.peer]

    def onMessage(self, msg, binary):
        pass


class GameBoard:
    row_to_col_to_board_type = None

    def __init__(self):
        self.row_to_col_to_board_type = [['none' for x in range(0, 12)] for y in range(0, 9)]

    def set_cell(self, row, col, board_type):
        self.row_to_col_to_board_type[row][col] = board_type


class TileBag:
    tiles = None

    def __init__(self):
        tiles = [(y, x) for y in range(0, 9) for x in range(0, 12)]
        random.shuffle(tiles)
        self.tiles = tiles

    def get_tile(self):
        if len(self.tiles) > 0:
            return self.tiles.pop()
        else:
            return None

    def get_number_of_tiles_remaining(self):
        return len(self.tiles)


class Game:
    game_board = GameBoard()
    tile_bag = TileBag()

    def __init__(self):
        pass


random_game = Game()


def send_random_messages():
    messages = []
    for i in range(1, random.randrange(2, 5)):
        tile = random_game.tile_bag.get_tile()
        if tile is not None:
            board_type = random.choice(board_types)
            messages.append(['set-board-cell', tile[0], tile[1], board_type])
            random_game.game_board.set_cell(tile[0], tile[1], board_type)

    if len(messages) > 0:
        messages_json = json_encoder.encode(messages)
        print(messages_json)
        messages_json_bytes = messages_json.encode('utf-8')
        for client in clients.values():
            client.sendMessage(messages_json_bytes)

        asyncio.get_event_loop().call_later(.5, send_random_messages)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    else:
        debug = False

    factory = WebSocketServerFactory('ws://localhost:9000', debug=debug)
    factory.protocol = AcquireServerProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '127.0.0.1', 9000)
    server = loop.run_until_complete(coro)

    loop.call_later(3, send_random_messages)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
