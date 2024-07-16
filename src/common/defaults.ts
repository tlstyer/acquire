import type { GameState } from './gameState';
import { PB_GameBoardType } from './pb';

export const defaultGameStateHistory: GameState[] = [];

export const defaultTileRacks: (number | null)[][] = [];

export const defaultTileRack: (number | null)[] = [null, null, null, null, null, null];

export const defaultTileRackTypesList: (PB_GameBoardType | null)[][] = [];

export const defaultTileRackTypes: (PB_GameBoardType | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
];

const defaultGameBoardRow = [
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
  PB_GameBoardType.NOTHING,
];
export const defaultGameBoard: PB_GameBoardType[][] = [
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
];

export const defaultScoreBoard: number[][] = [];

export const defaultScoreBoardRow: number[] = [0, 0, 0, 0, 0, 0, 0, 60, 60];

export const defaultScoreBoardAvailable: number[] = [25, 25, 25, 25, 25, 25, 25];

export const defaultScoreBoardChainSize: number[] = [0, 0, 0, 0, 0, 0, 0];

export const defaultScoreBoardPrice: number[] = [0, 0, 0, 0, 0, 0, 0];

export const defaultSafeChains: boolean[] = [false, false, false, false, false, false, false];
