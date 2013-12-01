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


class AcquireServerProtocol(WebSocketServerProtocol):
    def onOpen(self):
        print 'connected:', self.peerstr
        clients[self.peerstr] = self

    def onClose(self, wasClean, code, reason):
        print 'disconnected:', self.peerstr
        del clients[self.peerstr]

    def onMessage(self, msg, binary):
        pass


def send_random_messages():
    messages = []
    for i in xrange(1, random.randrange(2, 20)):
        messages.append(['board', random.randrange(1, 10), random.randrange(1, 13), random.choice(board_types)])

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

    send_random_messages()

    reactor.run()
