#!/usr/bin/env python3.4m

import re
import ujson
import util


class AcquireLogProcessor:
    def __init__(self):
        self.client_id_to_username = {}

        regexes_to_ignore = [
            r'^ ',
            r'^$',
            r'^AttributeError:',
            r'^connection_lost$',
            r'^connection_made$',
            r'^\d+ receive timeout$',
            r'^\d+ send timeout$',
            r'^Exception in callback ',
            r'^handle:',
            r'^ImportError:',
            r'^KeyError:',
            r'^None close$',
            r'^socket\.send\(\) raised exception\.$',
            r'^Traceback \(most recent call last\):',
            r'^UnicodeEncodeError:',
        ]

        self.line_matchers_and_handlers = [
            ('command to client', re.compile(r'^([\d,]+) <- (.*)'), None),
            ('ignore', re.compile('|'.join(regexes_to_ignore)), None),
            ('command to server', re.compile(r'^(?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
            ('log v2', re.compile(r'^({.*)'), None),
            ('disconnect', re.compile(r'^(\d+) disconnect$'), None),
            ('connect v3', re.compile(r'^(?P<client_id>\d+) connect (?P<username>.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$'), self.handle_connect_v2_and_v3),
            ('game expired', re.compile(r'^game #(\d+) expired( \(internal #(\d+)\))?$'), None),
            ('connect v1', re.compile(r'^X connect \d+\.\d+\.\d+\.\d+(?::\d+)? (?P<username>.*)$'), self.handle_connect_v1),
            ('open', re.compile(r'^(?P<client_id>\d+) open \d+\.\d+\.\d+\.\d+(?::\d+)?$'), self.handle_open),
            ('close', re.compile(r'^(\d+) close$'), None),
            ('connect v2', re.compile(r'^(?P<client_id>\d+) connect \d+\.\d+\.\d+\.\d+ (?P<username>.+)$'), self.handle_connect_v2_and_v3),
            ('disconnect after error', re.compile(r'^\d+ -> (\d+) disconnect$'), None),
            ('log v1', re.compile(r'^result (.*)'), None),
            ('command to server after connect printing error', re.compile(r'^\d+ connect (?P<client_id>\d+) -> (?P<command>.*)'), self.handle_command_to_server),
        ]

        self.connect_v1_username = None

    def handle_command_to_server(self, match):
        username = self.client_id_to_username[match.group('client_id')]
        try:
            command = ujson.decode(match.group('command'))
            return True
        except ValueError:
            pass

    def handle_connect_v2_and_v3(self, match):
        self.client_id_to_username[match.group('client_id')] = match.group('username')
        return True

    def handle_connect_v1(self, match):
        self.connect_v1_username = match.group('username')
        return True

    def handle_open(self, match):
        self.client_id_to_username[match.group('client_id')] = self.connect_v1_username
        return True

    def go(self):
        line_type_to_count = {line_type: 0 for line_type, regex, handler in self.line_matchers_and_handlers}
        line_type_to_count['other'] = 0

        for path in util.get_log_file_paths('py'):
            self.client_id_to_username = {}

            with util.open_possibly_gzipped_file(path) as f:
                print(path)
                try:
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

        for line_type, count in sorted(line_type_to_count.items(), key=lambda x: (-x[1], x[0])):
            print(line_type, count)


def main():
    acquire_log_processor = AcquireLogProcessor()
    acquire_log_processor.go()


if __name__ == '__main__':
    main()
