for y in xrange(1, 9 + 1):
    board_body_row = '<tr class="row-' + str(y) + '">'
    for x in xrange(1, 12 + 1):
        board_body_row += '<td class="col-' + str(x) + '">' + str(x) + chr(64 + y) + '</td>'
    board_body_row += '</tr>'
    print board_body_row
