#!/usr/bin/env python3.4m

import enums
import inspect
import re
import sys

if __name__ == '__main__':
    mode = sys.argv[1]

    contents = sys.stdin.read()

    if mode == 'enums':
        contents = re.sub(r'(?<![A-Za-z0-9])enums\.([A-Za-z0-9]+)\.([A-Za-z0-9]+)(?:\.value)?(?![A-Za-z0-9])', lambda match: str(getattr(getattr(enums, match.group(1)), match.group(2)).value), contents)
        print(contents, end='')
