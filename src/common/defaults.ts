import type { GameState } from './game';
import { PB_GameBoardType } from './pb';

export function defaultGameStateHistory(): GameState[] {
	return [];
}

export function defaultTileRacks(): (number | null)[][] {
	return [];
}

export function defaultTileRack(): (number | null)[] {
	return [null, null, null, null, null, null];
}

export function defaultTileRackTypesList(): (PB_GameBoardType | null)[][] {
	return [];
}

export function defaultTileRackTypes(): (PB_GameBoardType | null)[] {
	return [null, null, null, null, null, null];
}

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
export function defaultGameBoard(): PB_GameBoardType[][] {
	return [
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
		[...defaultGameBoardRow],
	];
}

export function defaultScoreBoard(): number[][] {
	return [];
}

export function defaultScoreBoardRow(): number[] {
	return [0, 0, 0, 0, 0, 0, 0, 60, 60];
}

export function defaultScoreBoardAvailable(): number[] {
	return [25, 25, 25, 25, 25, 25, 25];
}

export function defaultScoreBoardChainSize(): number[] {
	return [0, 0, 0, 0, 0, 0, 0];
}

export function defaultScoreBoardPrice(): number[] {
	return [0, 0, 0, 0, 0, 0, 0];
}

export function defaultSafeChains(): boolean[] {
	return [false, false, false, false, false, false, false];
}
