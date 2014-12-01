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
    SetGamePlayerJoin = ()
    SetGamePlayerRejoin = ()
    SetGamePlayerLeave = ()
    SetGamePlayerJoinMissing = ()
    SetGameWatcherClientId = ()
    ReturnWatcherToLobby = ()
    AddGameHistoryMessage = ()
    AddGameHistoryMessages = ()
    SetTurn = ()
    SetGameAction = ()
    SetTile = ()
    SetTileGameBoardType = ()
    RemoveTile = ()
    AddGlobalChatMessage = ()
    AddGameChatMessage = ()
    DestroyGame = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()
    JoinGame = ()
    RejoinGame = ()
    WatchGame = ()
    LeaveGame = ()
    DoGameAction = ()
    SendGlobalChatMessage = ()
    SendGameChatMessage = ()


class Errors(AutoNumber):
    NotUsingLatestVersion = ()
    GenericError = ()
    InvalidUsername = ()
    InvalidPassword = ()
    MissingPassword = ()
    ProvidedPassword = ()
    IncorrectPassword = ()
    NonMatchingPasswords = ()
    ExistingPassword = ()
    UsernameAlreadyInUse = ()
    LostConnection = ()


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
    CouldNotAffordAnyShares = ()
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


class Notifications(AutoNumber):
    GameFull = ()
    GameStarted = ()
    YourTurn = ()
    GameOver = ()


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
