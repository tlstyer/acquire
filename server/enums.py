import enum


class CommandsToClient(enum.Enum):
    FatalError = 0
    SetClientId = 1
    SetClientIdToData = 2
    SetGameState = 3
    SetGameBoardCell = 4
    SetGameBoard = 5
    SetScoreSheetCell = 6
    SetScoreSheet = 7
    SetGamePlayerJoin = 8
    SetGamePlayerRejoin = 9
    SetGamePlayerLeave = 10
    SetGamePlayerJoinMissing = 11
    SetGameWatcherClientId = 12
    ReturnWatcherToLobby = 13
    AddGameHistoryMessage = 14
    AddGameHistoryMessages = 15
    SetTurn = 16
    SetGameAction = 17
    SetTile = 18
    SetTileGameBoardType = 19
    RemoveTile = 20
    AddGlobalChatMessage = 21
    AddGameChatMessage = 22
    DestroyGame = 23


class CommandsToServer(enum.Enum):
    CreateGame = 0
    JoinGame = 1
    RejoinGame = 2
    WatchGame = 3
    LeaveGame = 4
    DoGameAction = 5
    SendGlobalChatMessage = 6
    SendGameChatMessage = 7


class Errors(enum.Enum):
    NotUsingLatestVersion = 0
    GenericError = 1
    InvalidUsername = 2
    InvalidPassword = 3
    MissingPassword = 4
    ProvidedPassword = 5
    IncorrectPassword = 6
    NonMatchingPasswords = 7
    ExistingPassword = 8
    UsernameAlreadyInUse = 9
    LostConnection = 10


class GameActions(enum.Enum):
    StartGame = 0
    PlayTile = 1
    SelectNewChain = 2
    SelectMergerSurvivor = 3
    SelectChainToDisposeOfNext = 4
    DisposeOfShares = 5
    PurchaseShares = 6
    GameOver = 7


class GameBoardTypes(enum.Enum):
    Luxor = 0
    Tower = 1
    American = 2
    Festival = 3
    Worldwide = 4
    Continental = 5
    Imperial = 6
    Nothing = 7
    NothingYet = 8
    CantPlayEver = 9
    IHaveThis = 10
    WillPutLonelyTileDown = 11
    HaveNeighboringTileToo = 12
    WillFormNewChain = 13
    WillMergeChains = 14
    CantPlayNow = 15
    Max = 16


class GameHistoryMessages(enum.Enum):
    TurnBegan = 0
    DrewPositionTile = 1
    StartedGame = 2
    DrewTile = 3
    HasNoPlayableTile = 4
    PlayedTile = 5
    FormedChain = 6
    MergedChains = 7
    SelectedMergerSurvivor = 8
    SelectedChainToDisposeOfNext = 9
    ReceivedBonus = 10
    DisposedOfShares = 11
    CouldNotAffordAnyShares = 12
    PurchasedShares = 13
    DrewLastTile = 14
    ReplacedDeadTile = 15
    EndedGame = 16
    NoTilesPlayedForEntireRound = 17
    AllTilesPlayed = 18


class GameModes(enum.Enum):
    Singles = 0
    Teams = 1
    Max = 2


class GameStates(enum.Enum):
    Starting = 0
    StartingFull = 1
    InProgress = 2
    Completed = 3


class Notifications(enum.Enum):
    GameFull = 0
    GameStarted = 1
    YourTurn = 2
    GameOver = 3


class Options(enum.Enum):
    EnablePageTitleNotifications = 0
    Sound = 1
    Volume = 2
    EnableHighContrastColors = 3
    EnableTextBackgroundColors = 4
    ColorScheme = 5
    GameBoardLabelMode = 6


class ScoreSheetIndexes(enum.Enum):
    Luxor = 0
    Tower = 1
    American = 2
    Festival = 3
    Worldwide = 4
    Continental = 5
    Imperial = 6
    Cash = 7
    Net = 8
    Username = 9
    PositionTile = 10
    Client = 11


class ScoreSheetRows(enum.Enum):
    Player0 = 0
    Player1 = 1
    Player2 = 2
    Player3 = 3
    Player4 = 4
    Player5 = 5
    Available = 6
    ChainSize = 7
    Price = 8
