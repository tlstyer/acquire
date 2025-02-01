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
  constructor(public playerId: number) {}
}

export class GameHistoryMessageDrewPositionTile {
  constructor(
    public playerId: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageStartedGame {
  constructor(public playerId: number) {}
}

export class GameHistoryMessageDrewTile {
  constructor(
    public playerId: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageHasNoPlayableTile {
  constructor(public playerId: number) {}
}

export class GameHistoryMessagePlayedTile {
  constructor(
    public playerId: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageFormedChain {
  constructor(
    public playerId: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageMergedChains {
  constructor(
    public playerId: number,
    public chains: PB_GameBoardType[],
  ) {}
}

export class GameHistoryMessageSelectedMergerSurvivor {
  constructor(
    public playerId: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageSelectedChainToDisposeOfNext {
  constructor(
    public playerId: number,
    public chain: PB_GameBoardType,
  ) {}
}

export class GameHistoryMessageReceivedBonus {
  constructor(
    public playerId: number,
    public chain: PB_GameBoardType,
    public amount: number,
  ) {}
}

export class GameHistoryMessageDisposedOfShares {
  constructor(
    public playerId: number,
    public chain: PB_GameBoardType,
    public tradeAmount: number,
    public sellAmount: number,
  ) {}
}

export class GameHistoryMessageCouldNotAffordAnyShares {
  constructor(public playerId: number) {}
}

export class GameHistoryMessagePurchasedShares {
  constructor(
    public playerId: number,
    public chainsAndCounts: ChainAndCount[],
  ) {}
}

export class GameHistoryMessageDrewLastTile {
  constructor(public playerId: number) {}
}

export class GameHistoryMessageReplacedDeadTile {
  constructor(
    public playerId: number,
    public tile: number,
  ) {}
}

export class GameHistoryMessageEndedGame {
  constructor(public playerId: number) {}
}

export class GameHistoryMessageNoTilesPlayedForEntireRound {}

export class GameHistoryMessageAllTilesPlayed {}

export class ChainAndCount {
  constructor(
    public chain: PB_GameBoardType,
    public count: number,
  ) {}
}
