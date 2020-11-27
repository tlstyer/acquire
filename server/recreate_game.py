import inspect
import orm
import os
import pickle
import re
import server
import sqlalchemy.sql

server_dict = {x: y for x, y in inspect.getmembers(server)}


def recreate_game(server_, filename):
    with open(filename, "rb") as f:
        game_data = pickle.load(f)

    game = server.Game.__new__(server.Game)

    game.game_id = server_.next_game_id_manager.get_id()
    game.internal_game_id = server_.next_internal_game_id_manager.get_id()
    game.state = game_data["state"]
    game.mode = game_data["mode"]
    game.max_players = game_data["max_players"]
    game.num_players = game_data["num_players"]
    game.tile_bag = game_data["tile_bag"]
    game.turn_player_id = game_data["turn_player_id"]
    game.turns_without_played_tiles_count = game_data[
        "turns_without_played_tiles_count"
    ]
    game.history_messages = game_data["history_messages"]

    game.add_pending_messages = server_.add_pending_messages
    game.logging_enabled = True
    game.client_ids = set()
    game.watcher_client_ids = set()
    game.expiration_time = None

    game.game_board = server.GameBoard(game, game_data["game_board"])

    game.score_sheet = server.ScoreSheet.__new__(server.ScoreSheet)
    game.score_sheet.game = game
    game.score_sheet.__dict__.update(game_data["score_sheet"])

    if game_data["tile_racks"] is None:
        game.tile_racks = None
    else:
        game.tile_racks = server.TileRacks.__new__(server.TileRacks)
        game.tile_racks.game = game
        game.tile_racks.racks = game_data["tile_racks"]

    game.actions = []
    for action_data in game_data["actions"]:
        cls = server_dict[action_data["__name__"]]
        action = cls.__new__(cls)
        action.game = game
        for key, value in action_data.items():
            if key != "__name__":
                action.__dict__[key] = value
        game.actions.append(action)

    game.log_data_overrides = {
        "log-time": game_data["log_time"],
        "game-id": game_data["internal_game_id"],
        "external-game-id": game_data["game_id"],
        "end": game_data["begin"] + 1800,
    }

    server_.game_id_to_game[game.game_id] = game


def recreate_some_games(server_):
    input_dir = "/opt/data/tim/"
    regex = re.compile(r"^(\d+)_0*(\d+)_0*(\d+).bin$")

    in_progress_game_files = {}
    for filename in os.listdir(input_dir):
        match = regex.match(filename)
        if match:
            log_timestamp, internal_game_id, num_tiles_played = (
                int(match.group(1)),
                int(match.group(2)),
                int(match.group(3)),
            )
            in_progress_game_files[(log_timestamp, internal_game_id)] = (
                num_tiles_played,
                filename,
            )

    sql = sqlalchemy.sql.text(
        """
        select
            log_time,
            number
        from game
        where completed_by_admin = 1
    """
    )
    with orm.session_scope() as session:
        for row in session.execute(sql):
            key = (row.log_time, row.number)
            if key in in_progress_game_files:
                del in_progress_game_files[key]

    num_tiles_played_and_filenames = sorted(
        in_progress_game_files.values(), key=lambda x: (-x[0], x[1])
    )

    for num_tiles_played_and_filenames in num_tiles_played_and_filenames[:5]:
        num_tiles_played, filename = num_tiles_played_and_filenames
        filename = input_dir + filename
        print(filename)
        recreate_game(server_, filename)
