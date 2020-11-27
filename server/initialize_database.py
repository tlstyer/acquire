import orm
import subprocess


def main():
    subprocess.call(
        [
            "mysql",
            "-u",
            "root",
            "-proot",
            "-e",
            "drop schema if exists `acquire`; create schema `acquire` default character set utf8mb4 collate utf8mb4_bin;",
        ]
    )

    orm.Base.metadata.create_all(orm.engine)

    with orm.session_scope() as session:
        session.add(orm.GameMode(name="Singles"))
        session.add(orm.GameMode(name="Teams"))

        session.add(orm.GameState(name="Starting"))
        session.add(orm.GameState(name="StartingFull"))
        session.add(orm.GameState(name="InProgress"))
        session.add(orm.GameState(name="Completed"))

        session.add(orm.RatingType(name="Singles2"))
        session.add(orm.RatingType(name="Singles3"))
        session.add(orm.RatingType(name="Singles4"))
        session.add(orm.RatingType(name="Teams"))


if __name__ == "__main__":
    main()
