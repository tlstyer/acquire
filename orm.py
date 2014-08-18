from sqlalchemy import create_engine, Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.mysql import FLOAT, INTEGER, SMALLINT, TINYINT, VARCHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()
engine = create_engine('mysql+mysqlconnector://root:root@localhost:3306/acquire')


class Game(Base):
    __tablename__ = 'game'
    game_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    log_time = Column(INTEGER(unsigned=True), nullable=False)
    number = Column(INTEGER(unsigned=True), nullable=False)
    begin_time = Column(INTEGER(unsigned=True))
    end_time = Column(INTEGER(unsigned=True))
    game_state_id = Column(TINYINT(unsigned=True), ForeignKey('game_state.game_state_id'), nullable=False)
    game_mode_id = Column(TINYINT(unsigned=True), ForeignKey('game_mode.game_mode_id'), nullable=False)
    imported = Column(TINYINT(unsigned=True), nullable=False)
    __table_args__ = (UniqueConstraint('log_time', 'number'),)

    game_state = relationship('GameState')
    game_mode = relationship('GameMode')

    def __repr__(self):
        params = (repr(self.game_id), repr(self.log_time), repr(self.number), repr(self.begin_time), repr(self.end_time), repr(self.game_state_id), repr(self.game_mode_id), repr(self.imported))
        return '<Game(game_id=%s, log_time=%s, number=%s, begin_time=%s, end_time=%s, game_state_id=%s, game_mode_id=%s, imported=%s)>' % params


class GameMode(Base):
    __tablename__ = 'game_mode'
    game_mode_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(VARCHAR(length=255), nullable=False)
    __table_args__ = (UniqueConstraint('name'),)

    def __repr__(self):
        params = (repr(self.game_mode_id), repr(self.name))
        return '<GameMode(game_mode_id=%s, name=%s)>' % params


class GamePlayer(Base):
    __tablename__ = 'game_player'
    game_player_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    game_id = Column(INTEGER(unsigned=True), ForeignKey('game.game_id'), nullable=False)
    player_index = Column(TINYINT(unsigned=True), nullable=False)
    user_id = Column(INTEGER(unsigned=True), ForeignKey('user.user_id'), nullable=False)
    score = Column(SMALLINT(unsigned=True))
    __table_args__ = (UniqueConstraint('game_id', 'player_index'),)

    game = relationship('Game')
    user = relationship('User')

    def __repr__(self):
        params = (repr(self.game_player_id), repr(self.game_id), repr(self.player_index), repr(self.user_id), repr(self.score))
        return '<GamePlayer(game_player_id=%s, game_id=%s, player_index=%s, user_id=%s, score=%s)>' % params


class GameState(Base):
    __tablename__ = 'game_state'
    game_state_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(VARCHAR(length=255), nullable=False)
    __table_args__ = (UniqueConstraint('name'),)

    def __repr__(self):
        params = (repr(self.game_state_id), repr(self.name))
        return '<GameState(game_state_id=%s, name=%s)>' % params


class Rating(Base):
    __tablename__ = 'rating'
    rating_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    user_id = Column(INTEGER(unsigned=True), ForeignKey('user.user_id'), nullable=False)
    rating_type_id = Column(TINYINT(unsigned=True), ForeignKey('rating_type.rating_type_id'), nullable=False)
    time = Column(INTEGER(unsigned=True), nullable=False)
    mu = Column(FLOAT(), nullable=False)
    sigma = Column(FLOAT(), nullable=False)

    def __repr__(self):
        params = (repr(self.rating_id), repr(self.user_id), repr(self.rating_type_id), repr(self.time), repr(self.mu), repr(self.sigma))
        return '<Rating(rating_id=%s, user_id=%s, rating_type_id=%s, time=%s, mu=%s, sigma=%s)>' % params


class RatingType(Base):
    __tablename__ = 'rating_type'
    rating_type_id = Column(TINYINT(unsigned=True), primary_key=True, nullable=False)
    name = Column(VARCHAR(length=255), nullable=False)
    __table_args__ = (UniqueConstraint('name'),)

    def __repr__(self):
        params = (repr(self.rating_type_id), repr(self.name))
        return '<RatingType(rating_type_id=%s, name=%s)>' % params


class User(Base):
    __tablename__ = 'user'
    user_id = Column(INTEGER(unsigned=True), primary_key=True, nullable=False)
    name = Column(VARCHAR(length=255), nullable=False)
    __table_args__ = (UniqueConstraint('name'),)

    def __repr__(self):
        params = (repr(self.user_id), repr(self.name))
        return '<User(user_id=%s, name=%s)>' % params
