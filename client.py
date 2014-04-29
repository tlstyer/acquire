for y in range(0, 9):
    board_body_row = '<tr class="row-' + str(y) + '">'
    for x in range(0, 12):
        board_body_row += '<td class="col-' + str(x) + '">' + str(x + 1) + chr(y + 65) + '</td>'
    board_body_row += '</tr>'
    print(board_body_row)
