import json
import sys
import random
from twisted.internet import reactor
from twisted.python import log
from autobahn.websocket import WebSocketServerFactory, \
    WebSocketServerProtocol, \
    listenWS


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
        print 'connected:', self.peerstr
        clients[self.peerstr] = self
        self.sendMessage(json_encoder.encode([['set-board', random_game.game_board.row_to_col_to_board_type]]))

    def onClose(self, wasClean, code, reason):
        print 'disconnected:', self.peerstr
        del clients[self.peerstr]

    def onMessage(self, msg, binary):
        pass


class GameBoard:
    row_to_col_to_board_type = None

    def __init__(self):
        self.row_to_col_to_board_type = [['none' for x in xrange(0, 12)] for y in xrange(0, 9)]

    def set_cell(self, row, col, board_type):
        self.row_to_col_to_board_type[row][col] = board_type


class TileBag:
    tiles = None

    def __init__(self):
        tiles = [(y, x) for y in xrange(0, 9) for x in xrange(0, 12)]
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
    for i in xrange(1, random.randrange(2, 5)):
        tile = random_game.tile_bag.get_tile()
        if tile is not None:
            board_type = random.choice(board_types)
            messages.append(['set-board-cell', tile[0], tile[1], board_type])
            random_game.game_board.set_cell(tile[0], tile[1], board_type)

    if len(messages) > 0:
        messages_json = json_encoder.encode(messages)
        print messages_json
        for client in clients.itervalues():
            client.sendMessage(messages_json)

        reactor.callLater(.5, send_random_messages)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        log.startLogging(sys.stdout)
        debug = True
    else:
        debug = False

    factory = WebSocketServerFactory("ws://localhost:9000",
                                     debug=debug,
                                     debugCodePaths=debug)

    factory.protocol = AcquireServerProtocol
    listenWS(factory)

    reactor.callLater(3, send_random_messages)

    reactor.run()
