#!/usr/bin/env python3.4m

import re
import ujson
import util


class AcquireLogProcessor:
    def __init__(self):
        self.client_id_to_username = {}

        self.line_matchers_and_handlers = [
            ('empty', re.compile(r'^$'), None),
            ('command to client', re.compile(r'^([\d,]+) <- (.*)'), None),
            ('command to server', re.compile(r'^(\d+) -> (.*)'), self.handle_command_to_server),
            ('log', re.compile(r'^{'), None),
            ('connect2', re.compile(r'^(\d+) connect (.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$'), self.handle_connect1_and_connect2),
            ('disconnect', re.compile(r'^(\d+) disconnect$'), None),
            ('game expired', re.compile(r'^game #(\d+) expired( \(internal #(\d+)\))?$'), None),
            ('connection made', re.compile(r'^connection_made$'), None),
            ('connect1', re.compile(r'^(\d+) connect \d+\.\d+\.\d+\.\d+ (.+)$'), self.handle_connect1_and_connect2),
            ('error', re.compile(r'^(Traceback \(most recent call last\):|UnicodeEncodeError:)'), None),
            ('error detail', re.compile(r'^ '), None),
            ('disconnect after error', re.compile(r'^\d+ -> (\d+) disconnect$'), None),
        ]

    def handle_command_to_server(self, match):
        username = self.client_id_to_username[match.group(1)]
        try:
            command = ujson.decode(match.group(2))
            return True
        except ValueError:
            pass

    def handle_connect1_and_connect2(self, match):
        self.client_id_to_username[match.group(1)] = match.group(2)
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
                        line = line.rstrip()

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

        for line_type, count in sorted(line_type_to_count.items(), key=lambda x: (x[1], x[0]), reverse=True):
            print(line_type, count)


def main():
    acquire_log_processor = AcquireLogProcessor()
    acquire_log_processor.go()


if __name__ == '__main__':
    main()
