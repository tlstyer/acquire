import enum


# from https://docs.python.org/3/library/enum.html#autonumber, slightly modified
class AutoNumber(enum.Enum):
    def __new__(cls):
        value = len(cls.__members__)
        obj = object.__new__(cls)
        obj._value_ = value
        return obj


class GameBoardTypes(AutoNumber):
    Luxor = ()
    Tower = ()
    American = ()
    Festival = ()
    Worldwide = ()
    Continental = ()
    Imperial = ()
    Nothing = ()
    NothingYet = ()
    CantPlayEver = ()
    IHaveThis = ()


class CommandsToClient(AutoNumber):
    FatalError = ()
    SetClientId = ()
    SetClientIdToUsername = ()
    CreateGame = ()
    SetGameBoardType = ()
    SetGamePlayerUsername = ()
    SetGamePlayerClientId = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()


class FatalErrors(AutoNumber):
    InvalidUsername = ()
    UsernameAlreadyInUse = ()


class GameStates(AutoNumber):
    PreGame = ()
    Started = ()
    Finished = ()


class ScoreSheetPlayerIndexes(AutoNumber):
    Luxor = ()
    Tower = ()
    American = ()
    Festival = ()
    Worldwide = ()
    Continental = ()
    Imperial = ()
    Cash = ()
    Net = ()
    Username = ()
    StartingTile = ()
    Client = ()
