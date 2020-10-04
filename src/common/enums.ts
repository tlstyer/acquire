export enum MessageToClientEnum {
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

export enum MessageToServerEnum {
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

export enum GameActionEnum {
  StartGame,
  PlayTile,
  SelectNewChain,
  SelectMergerSurvivor,
  SelectChainToDisposeOfNext,
  DisposeOfShares,
  PurchaseShares,
  GameOver,
}

export enum GameHistoryMessageEnum {
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

export enum GameSetupChangeEnum {
  UserAdded,
  UserRemoved,
  UserApprovedOfGameSetup,
  GameModeChanged,
  PlayerArrangementModeChanged,
  PositionsSwapped,
  UserKicked,
}

export enum ScoreBoardIndexEnum {
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

export enum TileEnum {
  Unknown = -1,
}
