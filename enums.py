import enum


# from https://docs.python.org/3/library/enum.html#autonumber, slightly modified
class AutoNumber(enum.Enum):
    def __new__(cls):
        value = len(cls.__members__)
        obj = object.__new__(cls)
        obj._value_ = value
        return obj


class CommandsToClient(AutoNumber):
    FatalError = ()
    SetClientId = ()
    SetClientIdToData = ()
    SetGameState = ()
    SetGameBoardCell = ()
    SetGameBoard = ()
    SetScoreSheetCell = ()
    SetScoreSheet = ()
    SetGamePlayerUsername = ()
    SetGamePlayerClientId = ()
    SetGameWatcherClientId = ()
    ReturnWatcherToLobby = ()
    AddGameHistoryMessage = ()
    SetTurn = ()
    SetGameAction = ()
    SetTile = ()
    SetTileGameBoardType = ()
    RemoveTile = ()
    AddGlobalChatMessage = ()
    AddGameChatMessage = ()
    DestroyGame = ()
    Heartbeat = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()
    JoinGame = ()
    RejoinGame = ()
    WatchGame = ()
    LeaveGame = ()
    DoGameAction = ()
    SendGlobalChatMessage = ()
    SendGameChatMessage = ()
    Heartbeat = ()


class FatalErrors(AutoNumber):
    NotUsingLatestVersion = ()
    InvalidUsername = ()
    UsernameAlreadyInUse = ()


class GameActions(AutoNumber):
    StartGame = ()
    PlayTile = ()
    SelectNewChain = ()
    SelectMergerSurvivor = ()
    SelectChainToDisposeOfNext = ()
    DisposeOfShares = ()
    PurchaseShares = ()
    GameOver = ()


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
    WillPutLonelyTileDown = ()
    HaveNeighboringTileToo = ()
    WillFormNewChain = ()
    WillMergeChains = ()
    CantPlayNow = ()
    Max = ()


class GameHistoryMessages(AutoNumber):
    TurnBegan = ()
    DrewPositionTile = ()
    StartedGame = ()
    DrewTile = ()
    HasNoPlayableTile = ()
    PlayedTile = ()
    FormedChain = ()
    MergedChains = ()
    SelectedMergerSurvivor = ()
    SelectedChainToDisposeOfNext = ()
    ReceivedBonus = ()
    DisposedOfShares = ()
    PurchasedShares = ()
    DrewLastTile = ()
    ReplacedDeadTile = ()
    EndedGame = ()
    NoTilesPlayedForEntireRound = ()
    AllTilesPlayed = ()


class GameModes(AutoNumber):
    Singles = ()
    Teams = ()
    Max = ()


class GameStates(AutoNumber):
    Starting = ()
    StartingFull = ()
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
    PositionTile = ()
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
