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
    SetGameBoardCell = ()
    SetGameBoard = ()
    SetScoreSheet = ()
    SetGamePlayerUsername = ()
    SetGamePlayerClientId = ()
    SetGameWatcherClientId = ()
    ReturnWatcherToLobby = ()
    AddGameHistoryMessage = ()
    SetGameAction = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()
    JoinGame = ()
    RejoinGame = ()
    WatchGame = ()
    LeaveGame = ()
    StartGame = ()


class FatalErrors(AutoNumber):
    InvalidUsername = ()
    UsernameAlreadyInUse = ()


class GameActions(AutoNumber):
    StartGame = ()
    PlayTile = ()
    PurchaseStock = ()


class GameHistoryMessages(AutoNumber):
    DrewStartingTile = ()
    StartedGame = ()
    DrewTile = ()


class GameStates(AutoNumber):
    Starting = ()
    InProgress = ()
    Completed = ()


class ScoreSheetIndexes(AutoNumber):
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
    IsCreator = ()


class ScoreSheetRows(AutoNumber):
    Player0 = ()
    Player1 = ()
    Player2 = ()
    Player3 = ()
    Player4 = ()
    Player5 = ()
    Available = ()
    ChainSize = ()
    Price = ()
