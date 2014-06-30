#!/usr/bin/env python3.4m

import enums
import inspect

parts = []

for obj in inspect.getmembers(enums):
    if inspect.isclass(obj[1]) and obj[0] != 'AutoNumber':
        lookups = []
        for name, member in obj[1].__members__.items():
            lookups.append('\t\t\t{}: {}'.format(name, member.value))
            lookups.append("\t\t\t{}: '{}'".format(member.value, name))
        parts.append('\t\t' + obj[0] + ': {\n' + ',\n'.join(lookups) + '\n\t\t}')

print('define(function(require) {')
print('\treturn {')

print(',\n'.join(parts))

print('\t};')
print('});')
