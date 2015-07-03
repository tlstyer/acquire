#!/usr/bin/env python3.4m

import collections
import re
import ujson
import util

re_connect1 = re.compile(r'^(\d+) connect \d+\.\d+\.\d+\.\d+ (.+)$')
re_connect2 = re.compile(r'^(\d+) connect (.+) \d+\.\d+\.\d+\.\d+ \S+(?: (?:True|False))?$')
re_disconnect = re.compile(r'^(\d+) disconnect$')
re_disconnect_after_error = re.compile(r'^\d+ -> (\d+) disconnect$')
re_command_to_server = re.compile(r'^(\d+) -> (.*)')
re_command_to_client = re.compile(r'^([\d,]+) <- (.*)')
re_game_expired = re.compile(r'^game #(\d+) expired( \(internal #(\d+)\))?$')
re_error = re.compile(r'^(Traceback \(most recent call last\):|UnicodeEncodeError:)')


def main():
    line_type_to_count = collections.defaultdict(int)

    for path in util.get_log_file_paths('py'):
        client_id_to_username = {}

        with util.open_possibly_gzipped_file(path) as f:
            print(path)
            try:
                for line in f:
                    line = line.rstrip()

                    if len(line) == 0:
                        line_type_to_count['empty'] += 1
                        continue

                    match = re_command_to_client.match(line)
                    if match:
                        line_type_to_count['command to client'] += 1
                        continue

                    match = re_command_to_server.match(line)
                    if match:
                        username = client_id_to_username[match.group(1)]
                        try:
                            command = ujson.decode(match.group(2))
                            line_type_to_count['command to server'] += 1
                            continue
                        except ValueError:
                            match = re_disconnect_after_error.match(line)
                            if match:
                                line_type_to_count['disconnect after error'] += 1
                                continue
                            print('*** ValueError:', line)

                    if line[0] == '{':
                        line_type_to_count['log'] += 1
                        continue

                    match = re_connect2.match(line)
                    if match:
                        client_id_to_username[match.group(1)] = match.group(2)
                        line_type_to_count['connect2'] += 1
                        continue

                    match = re_disconnect.match(line)
                    if match:
                        line_type_to_count['disconnect'] += 1
                        continue

                    match = re_game_expired.match(line)
                    if match:
                        line_type_to_count['game expired'] += 1
                        continue

                    if line == 'connection_made':
                        line_type_to_count['connection made'] += 1
                        continue

                    match = re_connect1.match(line)
                    if match:
                        client_id_to_username[match.group(1)] = match.group(2)
                        line_type_to_count['connect1'] += 1
                        continue

                    match = re_error.match(line)
                    if match:
                        line_type_to_count['error'] += 1
                        continue

                    if line[0] == ' ':
                        line_type_to_count['error detail'] += 1
                        continue

                    line_type_to_count['other'] += 1

                    print(line)
            except KeyError:
                print('*** KeyError')

    for line_type, count in sorted(line_type_to_count.items(), key=lambda x: (x[1], x[0]), reverse=True):
        print(line_type, count)


if __name__ == '__main__':
    main()
