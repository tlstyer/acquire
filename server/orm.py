import collections
from contextlib import contextmanager
from sqlalchemy import (
    create_engine,
    Column,
    Index,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.mysql import FLOAT, INTEGER, SMALLINT, TINYINT
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()
engine = create_engine(
    "mysql+mysqlconnector://acquire:acquire@localhost/acquire?unix_socket=/var/run/mysqld/mysqld.sock",
    connect_args={"auth_plugin": "mysql_native_password"},
)
Session = sessionmaker(bind=engine)


@contextmanager
def session_scope():
    session = Session(autoflush=False)
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


class Game(Base):
    __tablename__ = "game"
    game_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    log_time = Column(INTEGER(unsigned=True), nullable=False)
    number = Column(INTEGER(unsigned=True), nullable=False)
    begin_time = Column(INTEGER(unsigned=True))
    end_time = Column(INTEGER(unsigned=True))
    game_state_id = Column(
        TINYINT(unsigned=True), ForeignKey("game_state.game_state_id"), nullable=False
    )
    game_mode_id = Column(
        TINYINT(unsigned=True), ForeignKey("game_mode.game_mode_id"), nullable=False
    )
    __table_args__ = (
        UniqueConstraint("log_time", "number"),
        Index("end_time", "end_time"),
    )

    game_state = relationship("GameState")
    game_mode = relationship("GameMode")

    def __repr__(self):
        params = (
            repr(self.game_id),
            repr(self.log_time),
            repr(self.number),
            repr(self.begin_time),
            repr(self.end_time),
            repr(self.game_state_id),
            repr(self.game_mode_id),
        )
        return (
            "Game(game_id=%s, log_time=%s, number=%s, begin_time=%s, end_time=%s, game_state_id=%s, game_mode_id=%s)"
            % params
        )


class GameMode(Base):
    __tablename__ = "game_mode"
    game_mode_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(String(8, convert_unicode="force"), nullable=False)
    __table_args__ = (UniqueConstraint("name"),)

    def __repr__(self):
        params = (repr(self.game_mode_id), repr(self.name))
        return "GameMode(game_mode_id=%s, name=%s)" % params


class GamePlayer(Base):
    __tablename__ = "game_player"
    game_player_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    game_id = Column(INTEGER(unsigned=True), ForeignKey("game.game_id"), nullable=False)
    player_index = Column(TINYINT(unsigned=True), nullable=False)
    user_id = Column(INTEGER(unsigned=True), ForeignKey("user.user_id"), nullable=False)
    score = Column(SMALLINT(unsigned=True))
    __table_args__ = (UniqueConstraint("game_id", "player_index"),)

    game = relationship("Game")
    user = relationship("User")

    def __repr__(self):
        params = (
            repr(self.game_player_id),
            repr(self.game_id),
            repr(self.player_index),
            repr(self.user_id),
            repr(self.score),
        )
        return (
            "GamePlayer(game_player_id=%s, game_id=%s, player_index=%s, user_id=%s, score=%s)"
            % params
        )


class GameState(Base):
    __tablename__ = "game_state"
    game_state_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(String(16, convert_unicode="force"), nullable=False)
    __table_args__ = (UniqueConstraint("name"),)

    def __repr__(self):
        params = (repr(self.game_state_id), repr(self.name))
        return "GameState(game_state_id=%s, name=%s)" % params


class KeyValue(Base):
    __tablename__ = "key_value"
    key_value_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    key = Column(String(32, convert_unicode="force"), nullable=False)
    value = Column(Text(convert_unicode="force"), nullable=False)
    __table_args__ = (UniqueConstraint("key"),)

    def __repr__(self):
        params = (repr(self.key_value_id), repr(self.key), repr(self.value))
        return "KeyValue(key_value_id=%s, key=%s, value=%s)" % params


class Rating(Base):
    __tablename__ = "rating"
    rating_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    user_id = Column(INTEGER(unsigned=True), ForeignKey("user.user_id"), nullable=False)
    rating_type_id = Column(
        TINYINT(unsigned=True), ForeignKey("rating_type.rating_type_id"), nullable=False
    )
    time = Column(INTEGER(unsigned=True), nullable=False)
    mu = Column(FLOAT(), nullable=False)
    sigma = Column(FLOAT(), nullable=False)
    __table_args__ = (Index("user_id_rating_type_id", "user_id", "rating_type_id"),)

    user = relationship("User")
    rating_type = relationship("RatingType")

    def __repr__(self):
        params = (
            repr(self.rating_id),
            repr(self.user_id),
            repr(self.rating_type_id),
            repr(self.time),
            repr(self.mu),
            repr(self.sigma),
        )
        return (
            "Rating(rating_id=%s, user_id=%s, rating_type_id=%s, time=%s, mu=%s, sigma=%s)"
            % params
        )


class RatingType(Base):
    __tablename__ = "rating_type"
    rating_type_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(String(8, convert_unicode="force"), nullable=False)
    __table_args__ = (UniqueConstraint("name"),)

    def __repr__(self):
        params = (repr(self.rating_type_id), repr(self.name))
        return "RatingType(rating_type_id=%s, name=%s)" % params


class User(Base):
    __tablename__ = "user"
    user_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    name = Column(String(32, convert_unicode="force"), nullable=False)
    password = Column(String(64, convert_unicode="force"))
    __table_args__ = (UniqueConstraint("name"),)

    def __repr__(self):
        params = (repr(self.user_id), repr(self.name), repr(self.password))
        return "User(user_id=%s, name=%s, password=%s)" % params


class Lookup:
    def __init__(self, session):
        self.session = session
        self.game_lookup = collections.defaultdict(dict)
        self.game_mode_lookup = {}
        self.game_player_lookup = collections.defaultdict(
            lambda: collections.defaultdict(dict)
        )
        self.game_state_lookup = {}
        self.key_value_lookup = {}
        self.rating_lookup = collections.defaultdict(dict)
        self.rating_type_lookup = {}
        self.user_lookup = {}

    def get_game(self, log_time, number):
        game = self.game_lookup[log_time].get(number, None)
        if game:
            return game

        game = (
            self.session.query(Game)
            .filter_by(log_time=log_time, number=number)
            .scalar()
        )
        if not game:
            game = Game(log_time=log_time, number=number)
            self.session.add(game)

        self.game_lookup[log_time][number] = game
        return game

    def get_game_mode(self, name):
        game_mode = self.game_mode_lookup.get(name, None)
        if game_mode:
            return game_mode

        game_mode = self.session.query(GameMode).filter_by(name=name).scalar()

        self.game_mode_lookup[name] = game_mode
        return game_mode

    def get_game_player(self, game, player_index):
        game_player = self.game_player_lookup[game.log_time][game.number].get(
            player_index, None
        )
        if game_player:
            return game_player

        if game.game_id:
            game_player = (
                self.session.query(GamePlayer)
                .filter_by(game_id=game.game_id, player_index=player_index)
                .scalar()
            )

        if not game_player:
            game_player = GamePlayer(game=game, player_index=player_index)
            self.session.add(game_player)

        self.game_player_lookup[game.log_time][game.number][player_index] = game_player
        return game_player

    def get_game_state(self, name):
        game_state = self.game_state_lookup.get(name, None)
        if game_state:
            return game_state

        game_state = self.session.query(GameState).filter_by(name=name).scalar()

        self.game_state_lookup[name] = game_state
        return game_state

    def get_key_value(self, key):
        key_value = self.key_value_lookup.get(key, None)
        if key_value:
            return key_value

        key_value = self.session.query(KeyValue).filter_by(key=key).scalar()
        if not key_value:
            key_value = KeyValue(key=key)
            self.session.add(key_value)

        self.key_value_lookup[key] = key_value
        return key_value

    def get_rating(self, user, rating_type):
        rating = self.rating_lookup[user.name].get(rating_type.name, None)
        if rating:
            return rating

        if user.user_id:
            rating = (
                self.session.query(Rating)
                .filter_by(user=user, rating_type=rating_type)
                .order_by(Rating.rating_id.desc())
                .limit(1)
                .scalar()
            )

        if rating:
            self.rating_lookup[user.name][rating_type.name] = rating

        return rating

    def add_rating(self, rating):
        self.rating_lookup[rating.user.name][rating.rating_type.name] = rating

    def get_rating_type(self, name):
        rating_type = self.rating_type_lookup.get(name, None)
        if rating_type:
            return rating_type

        rating_type = self.session.query(RatingType).filter_by(name=name).scalar()

        self.rating_type_lookup[name] = rating_type
        return rating_type

    def get_user(self, name):
        user = self.user_lookup.get(name, None)
        if user:
            return user

        user = self.session.query(User).filter_by(name=name).scalar()
        if not user:
            user = User(name=name)
            self.session.add(user)

        self.user_lookup[name] = user
        return user
