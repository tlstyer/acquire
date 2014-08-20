import collections
import orm


class Lookup:
    def __init__(self, session):
        self.session = session
        self.game_lookup = collections.defaultdict(dict)
        self.game_mode_lookup = {}
        self.game_player_lookup = collections.defaultdict(lambda: collections.defaultdict(dict))
        self.game_state_lookup = {}
        self.rating_lookup = collections.defaultdict(dict)
        self.rating_type_lookup = {}
        self.user_lookup = {}

    def get_game(self, log_time, number):
        game = self.game_lookup[log_time].get(number, None)
        if game:
            return game

        game = self.session.query(orm.Game).filter_by(log_time=log_time, number=number).scalar()
        if not game:
            game = orm.Game(log_time=log_time, number=number)
            self.session.add(game)

        self.game_lookup[log_time][number] = game
        return game

    def get_game_mode(self, name):
        game_mode = self.game_mode_lookup.get(name, None)
        if game_mode:
            return game_mode

        game_mode = self.session.query(orm.GameMode).filter_by(name=name).scalar()

        self.game_mode_lookup[name] = game_mode
        return game_mode

    def get_game_player(self, game, player_index):
        game_player = self.game_player_lookup[game.log_time][game.number].get(player_index, None)
        if game_player:
            return game_player

        if game.game_id:
            game_player = self.session.query(orm.GamePlayer).filter_by(game_id=game.game_id, player_index=player_index).scalar()

        if not game_player:
            game_player = orm.GamePlayer(game=game, player_index=player_index)
            self.session.add(game_player)

        self.game_player_lookup[game.log_time][game.number][player_index] = game_player
        return game_player

    def get_game_state(self, name):
        game_state = self.game_state_lookup.get(name, None)
        if game_state:
            return game_state

        game_state = self.session.query(orm.GameState).filter_by(name=name).scalar()

        self.game_state_lookup[name] = game_state
        return game_state

    def get_rating(self, user, rating_type):
        rating = self.rating_lookup[user.name].get(rating_type.name, None)
        if rating:
            return rating

        if user.user_id:
            rating = self.session.query(orm.Rating).filter_by(user=user, rating_type=rating_type).order_by(orm.Rating.rating_id.desc()).limit(1).scalar()

        if rating:
            self.rating_lookup[user.name][rating_type.name] = rating

        return rating

    def add_rating(self, rating):
        self.rating_lookup[rating.user.name][rating.rating_type.name] = rating

    def get_rating_type(self, name):
        rating_type = self.rating_type_lookup.get(name, None)
        if rating_type:
            return rating_type

        rating_type = self.session.query(orm.RatingType).filter_by(name=name).scalar()

        self.rating_type_lookup[name] = rating_type
        return rating_type

    def get_user(self, name):
        user = self.user_lookup.get(name, None)
        if user:
            return user

        user = self.session.query(orm.User).filter_by(name=name).scalar()
        if not user:
            user = orm.User(name=name)
            self.session.add(user)

        self.user_lookup[name] = user
        return user
