#!/usr/bin/env python3.4m

for y in range(0, 9):
    print('<tr>')
    for x in range(0, 12):
        print('\t<td id="gb-' + str(x) + '-' + str(y) + '">' + str(x + 1) + chr(y + 65) + '</td>')
    print('</tr>')
