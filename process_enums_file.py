#!/usr/bin/env python3.4m

import enums_preprocessed
import inspect


def get_lookups():
    lookups = {}

    for class_name in [obj[0] for obj in inspect.getmembers(enums_preprocessed) if inspect.isclass(obj[1]) and obj[0] != 'AutoNumber']:
        class_obj = getattr(enums_preprocessed, class_name)

        lookup = []
        for name, member in class_obj.__members__.items():
            lookup.append(name)

        lookups[class_name] = lookup

    return lookups


def main():
    parts = []
    for class_name, members in sorted(get_lookups().items()):
        part = ["    '" + class_name + "': ["]
        for member in members:
            part.append("        '" + member + "',")
        part.append("    ]")
        parts.append('\n'.join(part))

    print('lookups = {')
    print(',\n'.join(parts))
    print('}')


if __name__ == '__main__':
    main()
