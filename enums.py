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
    AddChatMessage = ()


class CommandsToServer(AutoNumber):
    CreateGame = ()
    JoinGame = ()
    RejoinGame = ()
    WatchGame = ()
    LeaveGame = ()
    DoGameAction = ()
    SendChatMessage = ()


class FatalErrors(AutoNumber):
    NotUsingLatestVersion = ()
    InvalidUsername = ()
    UsernameAlreadyInUse = ()


class GameActions(AutoNumber):
    StartGame = ()
    PlayTile = ()
    SelectNewChain = ()
    SelectMergerSurvivor = ()
    SelectChainToMerge = ()
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
    SelectedChainToMerge = ()
    ReceivedBonus = ()
    DisposedOfShares = ()
    PurchasedShares = ()
    DrewLastTile = ()
    ReplacedDeadTile = ()
    EndedGame = ()
    NoTilesPlayedForEntireRound = ()
    AllTilesPlayed = ()


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


# quick lookups
CommandsToClient_FatalError = 0
CommandsToClient_SetClientId = 1
CommandsToClient_SetClientIdToData = 2
CommandsToClient_SetGameState = 3
CommandsToClient_SetGameBoardCell = 4
CommandsToClient_SetGameBoard = 5
CommandsToClient_SetScoreSheetCell = 6
CommandsToClient_SetScoreSheet = 7
CommandsToClient_SetGamePlayerUsername = 8
CommandsToClient_SetGamePlayerClientId = 9
CommandsToClient_SetGameWatcherClientId = 10
CommandsToClient_ReturnWatcherToLobby = 11
CommandsToClient_AddGameHistoryMessage = 12
CommandsToClient_SetTurn = 13
CommandsToClient_SetGameAction = 14
CommandsToClient_SetTile = 15
CommandsToClient_SetTileGameBoardType = 16
CommandsToClient_RemoveTile = 17
CommandsToClient_AddChatMessage = 18
CommandsToServer_CreateGame = 0
CommandsToServer_JoinGame = 1
CommandsToServer_RejoinGame = 2
CommandsToServer_WatchGame = 3
CommandsToServer_LeaveGame = 4
CommandsToServer_DoGameAction = 5
CommandsToServer_SendChatMessage = 6
FatalErrors_NotUsingLatestVersion = 0
FatalErrors_InvalidUsername = 1
FatalErrors_UsernameAlreadyInUse = 2
GameActions_StartGame = 0
GameActions_PlayTile = 1
GameActions_SelectNewChain = 2
GameActions_SelectMergerSurvivor = 3
GameActions_SelectChainToMerge = 4
GameActions_DisposeOfShares = 5
GameActions_PurchaseShares = 6
GameActions_GameOver = 7
GameBoardTypes_Luxor = 0
GameBoardTypes_Tower = 1
GameBoardTypes_American = 2
GameBoardTypes_Festival = 3
GameBoardTypes_Worldwide = 4
GameBoardTypes_Continental = 5
GameBoardTypes_Imperial = 6
GameBoardTypes_Nothing = 7
GameBoardTypes_NothingYet = 8
GameBoardTypes_CantPlayEver = 9
GameBoardTypes_IHaveThis = 10
GameBoardTypes_WillPutLonelyTileDown = 11
GameBoardTypes_HaveNeighboringTileToo = 12
GameBoardTypes_WillFormNewChain = 13
GameBoardTypes_WillMergeChains = 14
GameBoardTypes_CantPlayNow = 15
GameBoardTypes_Max = 16
GameHistoryMessages_TurnBegan = 0
GameHistoryMessages_DrewPositionTile = 1
GameHistoryMessages_StartedGame = 2
GameHistoryMessages_DrewTile = 3
GameHistoryMessages_HasNoPlayableTile = 4
GameHistoryMessages_PlayedTile = 5
GameHistoryMessages_FormedChain = 6
GameHistoryMessages_MergedChains = 7
GameHistoryMessages_SelectedMergerSurvivor = 8
GameHistoryMessages_SelectedChainToMerge = 9
GameHistoryMessages_ReceivedBonus = 10
GameHistoryMessages_DisposedOfShares = 11
GameHistoryMessages_PurchasedShares = 12
GameHistoryMessages_DrewLastTile = 13
GameHistoryMessages_ReplacedDeadTile = 14
GameHistoryMessages_EndedGame = 15
GameHistoryMessages_NoTilesPlayedForEntireRound = 16
GameHistoryMessages_AllTilesPlayed = 17
GameStates_Starting = 0
GameStates_StartingFull = 1
GameStates_InProgress = 2
GameStates_Completed = 3
ScoreSheetIndexes_Luxor = 0
ScoreSheetIndexes_Tower = 1
ScoreSheetIndexes_American = 2
ScoreSheetIndexes_Festival = 3
ScoreSheetIndexes_Worldwide = 4
ScoreSheetIndexes_Continental = 5
ScoreSheetIndexes_Imperial = 6
ScoreSheetIndexes_Cash = 7
ScoreSheetIndexes_Net = 8
ScoreSheetIndexes_Username = 9
ScoreSheetIndexes_PositionTile = 10
ScoreSheetIndexes_Client = 11
ScoreSheetIndexes_IsCreator = 12
ScoreSheetRows_Player0 = 0
ScoreSheetRows_Player1 = 1
ScoreSheetRows_Player2 = 2
ScoreSheetRows_Player3 = 3
ScoreSheetRows_Player4 = 4
ScoreSheetRows_Player5 = 5
ScoreSheetRows_Available = 6
ScoreSheetRows_ChainSize = 7
ScoreSheetRows_Price = 8
