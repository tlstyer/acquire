import { TileEnum } from '../common/enums';
import { PB_GameBoardType, PB_GameMode, PB_GameStatus } from '../common/pb';

export const allChains = [
	PB_GameBoardType.LUXOR,
	PB_GameBoardType.TOWER,
	PB_GameBoardType.AMERICAN,
	PB_GameBoardType.FESTIVAL,
	PB_GameBoardType.WORLDWIDE,
	PB_GameBoardType.CONTINENTAL,
	PB_GameBoardType.IMPERIAL,
];

export const gameBoardTypeToCSSClassName = new Map([
	[PB_GameBoardType.LUXOR, 'color-luxor'],
	[PB_GameBoardType.TOWER, 'color-tower'],
	[PB_GameBoardType.AMERICAN, 'color-american'],
	[PB_GameBoardType.FESTIVAL, 'color-festival'],
	[PB_GameBoardType.WORLDWIDE, 'color-worldwide'],
	[PB_GameBoardType.CONTINENTAL, 'color-continental'],
	[PB_GameBoardType.IMPERIAL, 'color-imperial'],
	[PB_GameBoardType.NOTHING, 'color-nothing'],
	[PB_GameBoardType.NOTHING_YET, 'color-nothingYet'],
	[PB_GameBoardType.CANT_PLAY_EVER, 'color-cantPlayEver'],
	[PB_GameBoardType.I_HAVE_THIS, 'color-iHaveThis'],
	[PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN, 'color-willPutLonelyTileDown'],
	[PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO, 'color-haveNeighboringTileToo'],
	[PB_GameBoardType.WILL_FORM_NEW_CHAIN, 'color-willFormNewChain'],
	[PB_GameBoardType.WILL_MERGE_CHAINS, 'color-willMergeChains'],
	[PB_GameBoardType.CANT_PLAY_NOW, 'color-cantPlayNow'],
]);

export const gameBoardTypeToHotelInitial = new Map([
	[PB_GameBoardType.LUXOR, 'L'],
	[PB_GameBoardType.TOWER, 'T'],
	[PB_GameBoardType.AMERICAN, 'A'],
	[PB_GameBoardType.FESTIVAL, 'F'],
	[PB_GameBoardType.WORLDWIDE, 'W'],
	[PB_GameBoardType.CONTINENTAL, 'C'],
	[PB_GameBoardType.IMPERIAL, 'I'],
]);

export const gameBoardTypeToHotelName = new Map([
	[PB_GameBoardType.LUXOR, 'Luxor'],
	[PB_GameBoardType.TOWER, 'Tower'],
	[PB_GameBoardType.AMERICAN, 'American'],
	[PB_GameBoardType.FESTIVAL, 'Festival'],
	[PB_GameBoardType.WORLDWIDE, 'Worldwide'],
	[PB_GameBoardType.CONTINENTAL, 'Continental'],
	[PB_GameBoardType.IMPERIAL, 'Imperial'],
]);

export const teamNumberToCSSClassName = new Map([
	[1, 'color-team1'],
	[2, 'color-team2'],
	[3, 'color-team3'],
]);

export enum GameBoardLabelMode {
	Nothing,
	Coordinates,
	HotelInitials,
}

const yTileNames = 'ABCDEFGHI';

export function getTileString(tile: number) {
	if (tile === TileEnum.Unknown) {
		return '?';
	} else {
		return `${Math.floor(tile / 9) + 1}${yTileNames[tile % 9]}`;
	}
}

export const gameModeToString = new Map([
	[PB_GameMode.SINGLES_1, 'Singles 1'],
	[PB_GameMode.SINGLES_2, 'Singles 2'],
	[PB_GameMode.SINGLES_3, 'Singles 3'],
	[PB_GameMode.SINGLES_4, 'Singles 4'],
	[PB_GameMode.SINGLES_5, 'Singles 5'],
	[PB_GameMode.SINGLES_6, 'Singles 6'],
	[PB_GameMode.TEAMS_2_VS_2, 'Teams 2 vs 2'],
	[PB_GameMode.TEAMS_2_VS_2_VS_2, 'Teams 2 vs 2 vs 2'],
	[PB_GameMode.TEAMS_3_VS_3, 'Teams 3 vs 3'],
]);

export const gameStatusToString = new Map([
	[PB_GameStatus.SETTING_UP, 'Setting Up'],
	[PB_GameStatus.IN_PROGRESS, 'In Progress'],
	[PB_GameStatus.COMPLETED, 'Completed'],
]);

export const allGameModes = [
	PB_GameMode.SINGLES_1,
	PB_GameMode.SINGLES_2,
	PB_GameMode.SINGLES_3,
	PB_GameMode.SINGLES_4,
	PB_GameMode.SINGLES_5,
	PB_GameMode.SINGLES_6,
	PB_GameMode.TEAMS_2_VS_2,
	PB_GameMode.TEAMS_2_VS_2_VS_2,
	PB_GameMode.TEAMS_3_VS_3,
];

export const KEY_ALT = 1;
export const KEY_CTRL = 2;
export const KEY_META = 4;
export const KEY_SHIFT = 8;

export function keyboardEventToKeysAlsoPressed(event: KeyboardEvent) {
	return (
		(event.altKey ? KEY_ALT : 0) +
		(event.ctrlKey ? KEY_CTRL : 0) +
		(event.metaKey ? KEY_META : 0) +
		(event.shiftKey ? KEY_SHIFT : 0)
	);
}

export const keyboardEventCodeToGameBoardType = new Map([
	// Luxor
	['KeyL', PB_GameBoardType.LUXOR],
	['Digit1', PB_GameBoardType.LUXOR],
	['Numpad1', PB_GameBoardType.LUXOR],
	// Tower
	['KeyT', PB_GameBoardType.TOWER],
	['Digit2', PB_GameBoardType.TOWER],
	['Numpad2', PB_GameBoardType.TOWER],
	// American
	['KeyA', PB_GameBoardType.AMERICAN],
	['Digit3', PB_GameBoardType.AMERICAN],
	['Numpad3', PB_GameBoardType.AMERICAN],
	// Festival
	['KeyF', PB_GameBoardType.FESTIVAL],
	['Digit4', PB_GameBoardType.FESTIVAL],
	['Numpad4', PB_GameBoardType.FESTIVAL],
	// Worldwide
	['KeyW', PB_GameBoardType.WORLDWIDE],
	['Digit5', PB_GameBoardType.WORLDWIDE],
	['Numpad5', PB_GameBoardType.WORLDWIDE],
	// Continental
	['KeyC', PB_GameBoardType.CONTINENTAL],
	['Digit6', PB_GameBoardType.CONTINENTAL],
	['Numpad6', PB_GameBoardType.CONTINENTAL],
	// Imperial
	['KeyI', PB_GameBoardType.IMPERIAL],
	['Digit7', PB_GameBoardType.IMPERIAL],
	['Numpad7', PB_GameBoardType.IMPERIAL],
]);
