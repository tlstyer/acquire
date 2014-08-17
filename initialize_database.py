#!/usr/bin/env python3.4m

import subprocess
import orm
from sqlalchemy.orm import sessionmaker

subprocess.call(['mysql', '-u', 'root', '-proot', '-e', 'drop schema if exists `acquire`; create schema `acquire` default character set utf8 collate utf8_bin;'])

orm.Base.metadata.create_all(orm.engine)

Session = sessionmaker(bind=orm.engine)
session = Session()

session.add(orm.GameMode(name='Singles'))
session.add(orm.GameMode(name='Teams'))

session.add(orm.GameState(name='Starting'))
session.add(orm.GameState(name='StartingFull'))
session.add(orm.GameState(name='InProgress'))
session.add(orm.GameState(name='Completed'))

session.add(orm.RatingType(name='Singles2'))
session.add(orm.RatingType(name='Singles3'))
session.add(orm.RatingType(name='Singles4'))
session.add(orm.RatingType(name='Teams'))

session.commit()
