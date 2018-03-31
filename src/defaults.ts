import { List } from 'immutable';

import { GameBoardType } from './enums';

export const defaultTileRacks = List<List<number | null>>([]);

export const defaultTileRack = List<number | null>([null, null, null, null, null, null]);

export const defaultTileRackTypesList = List<List<GameBoardType | null>>([]);

export const defaultTileRackTypes = List<GameBoardType | null>([null, null, null, null, null, null]);

let dgb: GameBoardType[] = new Array(108);
for (let i = 0; i < 108; i++) {
    dgb[i] = GameBoardType.Nothing;
}
export const defaultGameBoard = List<GameBoardType>(dgb);

export const defaultScoreBoard = List<List<number>>([]);

export const defaultScoreBoardRow = List<number>([0, 0, 0, 0, 0, 0, 0, 60, 60]);

export const defaultScoreBoardAvailable = List<number>([25, 25, 25, 25, 25, 25, 25]);

export const defaultScoreBoardChainSize = List<number>([0, 0, 0, 0, 0, 0, 0]);

export const defaultScoreBoardPrice = defaultScoreBoardChainSize;
