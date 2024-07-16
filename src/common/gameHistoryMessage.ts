import type { PB_GameBoardType } from './pb';

export type GameHistoryMessage =
  | GameHistoryMessageTurnBegan
  | GameHistoryMessageDrewPositionTile
  | GameHistoryMessageStartedGame
  | GameHistoryMessageDrewTile
  | GameHistoryMessageHasNoPlayableTile
  | GameHistoryMessagePlayedTile
  | GameHistoryMessageFormedChain
  | GameHistoryMessageMergedChains
  | GameHistoryMessageSelectedMergerSurvivor
  | GameHistoryMessageSelectedChainToDisposeOfNext
  | GameHistoryMessageReceivedBonus
  | GameHistoryMessageDisposedOfShares
  | GameHistoryMessageCouldNotAffordAnyShares
  | GameHistoryMessagePurchasedShares
  | GameHistoryMessageDrewLastTile
  | GameHistoryMessageReplacedDeadTile
  | GameHistoryMessageEndedGame
  | GameHistoryMessageNoTilesPlayedForEntireRound
  | GameHistoryMessageAllTilesPlayed;

export class GameHistoryMessageTurnBegan {
  constructor(public playerID: number) {}
}

export class GameHistoryMessageDrewPositionTile {
  constructor(
    public playerID: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageStartedGame {
  constructor(public playerID: number) {}
}

export class GameHistoryMessageDrewTile {
  constructor(
    public playerID: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageHasNoPlayableTile {
  constructor(public playerID: number) {}
}

export class GameHistoryMessagePlayedTile {
  constructor(
    public playerID: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageFormedChain {
  constructor(
    public playerID: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageMergedChains {
  constructor(
    public playerID: number,
    public chains: PB_GameBoardType[],
  ) {}
}

export class GameHistoryMessageSelectedMergerSurvivor {
  constructor(
    public playerID: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageSelectedChainToDisposeOfNext {
  constructor(
    public playerID: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageReceivedBonus {
  constructor(
    public playerID: number,
    public chain: PB_GameBoardType,
    public amount: number,
  ) {}
}

export class GameHistoryMessageDisposedOfShares {
  constructor(
    public playerID: number,
    public chain: PB_GameBoardType,
    public tradeAmount: number,
    public sellAmount: number,
  ) {}
}

export class GameHistoryMessageCouldNotAffordAnyShares {
  constructor(public playerID: number) {}
}

export class GameHistoryMessagePurchasedShares {
  constructor(
    public playerID: number,
    public chainsAndCounts: ChainAndCount[],
  ) {}
}

export class GameHistoryMessageDrewLastTile {
  constructor(public playerID: number) {}
}

export class GameHistoryMessageReplacedDeadTile {
  constructor(
    public playerID: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageEndedGame {
  constructor(public playerID: number) {}
}

export class GameHistoryMessageNoTilesPlayedForEntireRound {}

export class GameHistoryMessageAllTilesPlayed {}

export class ChainAndCount {
  constructor(
    public chain: PB_GameBoardType,
    public count: number,
  ) {}
}
