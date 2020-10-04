export enum MessageToClient {
  FatalError,
  Greetings,
  ClientConnected,
  ClientDisconnected,
  GameCreated,
  ClientEnteredGame,
  ClientExitedGame,
  GameSetupChanged,
  GameStarted,
  GameActionDone,
}

export enum MessageToServer {
  CreateGame,
  EnterGame,
  ExitGame,
  JoinGame,
  UnjoinGame,
  ApproveOfGameSetup,
  ChangeGameMode,
  ChangePlayerArrangementMode,
  SwapPositions,
  KickUser,
  DoGameAction,
}

export enum GameAction {
  StartGame,
  PlayTile,
  SelectNewChain,
  SelectMergerSurvivor,
  SelectChainToDisposeOfNext,
  DisposeOfShares,
  PurchaseShares,
  GameOver,
}

export enum GameHistoryMessage {
  TurnBegan,
  DrewPositionTile,
  StartedGame,
  DrewTile,
  HasNoPlayableTile,
  PlayedTile,
  FormedChain,
  MergedChains,
  SelectedMergerSurvivor,
  SelectedChainToDisposeOfNext,
  ReceivedBonus,
  DisposedOfShares,
  CouldNotAffordAnyShares,
  PurchasedShares,
  DrewLastTile,
  ReplacedDeadTile,
  EndedGame,
  NoTilesPlayedForEntireRound,
  AllTilesPlayed,
}

export enum GameSetupChange {
  UserAdded,
  UserRemoved,
  UserApprovedOfGameSetup,
  GameModeChanged,
  PlayerArrangementModeChanged,
  PositionsSwapped,
  UserKicked,
}

export enum ScoreBoardIndex {
  Luxor,
  Tower,
  American,
  Festival,
  Worldwide,
  Continental,
  Imperial,
  Cash,
  Net,
  Max,
}

export enum Tile {
  Unknown = -1,
}
