import { List } from 'immutable';
import { GameState } from './game';
import { PB_GameBoardType } from './pb';

export const defaultGameStateHistory = List<GameState>([]);

export const defaultTileRacks = List<List<number | null>>([]);

export const defaultTileRack = List<number | null>([null, null, null, null, null, null]);

export const defaultTileRackTypesList = List<List<PB_GameBoardType | null>>([]);

export const defaultTileRackTypes = List<PB_GameBoardType | null>([null, null, null, null, null, null]);

const defaultGameBoardRow = List([
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
]);
export const defaultGameBoard = List([
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
  defaultGameBoardRow,
]);

export const defaultScoreBoard = List<List<number>>([]);

export const defaultScoreBoardRow = List([0, 0, 0, 0, 0, 0, 0, 60, 60]);

export const defaultScoreBoardAvailable = List([25, 25, 25, 25, 25, 25, 25]);

export const defaultScoreBoardChainSize = List([0, 0, 0, 0, 0, 0, 0]);

export const defaultScoreBoardPrice = defaultScoreBoardChainSize;

export const defaultSafeChains = List([false, false, false, false, false, false, false]);
