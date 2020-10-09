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
  Unknown = 108,
}
