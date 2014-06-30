#!/usr/bin/env python3.4m

import enums
import inspect

quick_lookups = []

for obj in inspect.getmembers(enums):
    class_name = obj[0]
    if inspect.isclass(obj[1]) and class_name != 'AutoNumber':
        for member_name in obj[1].__members__.keys():
            value = getattr(getattr(enums, class_name), member_name).value
            quick_lookups.append(class_name + '_' + member_name + ' = ' + str(value))

section_title = '# quick lookups'
quick_lookups_section = section_title + '\n' + '\n'.join(quick_lookups) + '\n'

with open('enums.py', 'r') as f:
    contents = f.read()

parts = contents.split(section_title)
contents = parts[0] + quick_lookups_section

with open('enums.py', 'w') as f:
    f.write(contents)
