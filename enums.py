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
    SetClientIdToData = ()
    SetGameState = ()
    SetGameBoardType = ()
    SetGamePlayerUsername = ()
    SetGamePlayerClientId = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()
    JoinGame = ()
    RejoinGame = ()
    WatchGame = ()


class FatalErrors(AutoNumber):
    InvalidUsername = ()
    UsernameAlreadyInUse = ()


class GameStates(AutoNumber):
    Starting = ()
    InProgress = ()
    Completed = ()


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
