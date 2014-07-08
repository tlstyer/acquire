#!/usr/bin/env python3.4m

import enums
import glob
import inspect
import re
import sys

if len(sys.argv) > 1 and sys.argv[1] == 'dist':
    class_names = set()
    for filename in glob.glob('dist/build/js/*.js'):
        with open(filename, 'r') as f:
            contents = f.read()
        for match in re.finditer(r'(?<![A-Za-z0-9])enums\.([A-Za-z0-9]+)(?![A-Za-z0-9])', contents):
            class_names.add(match.group(1))
    class_names = sorted(class_names)
    include_str_to_int = False
else:
    class_names = [obj[0] for obj in inspect.getmembers(enums) if inspect.isclass(obj[1]) and obj[0] != 'AutoNumber']
    include_str_to_int = True

parts = []

for class_name in class_names:
    class_obj = getattr(enums, class_name)
    lookups = []
    for name, member in class_obj.__members__.items():
        if include_str_to_int:
            lookups.append('\t\t\t{}: {}'.format(name, member.value))
        lookups.append("\t\t\t{}: '{}'".format(member.value, name))
    parts.append('\t\t' + class_name + ': {\n' + ',\n'.join(lookups) + '\n\t\t}')

print('define(function(require) {')
print('\treturn {')

print(',\n'.join(parts))

print('\t};')
print('});')
