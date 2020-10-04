import * as common from './common.scss';

import * as React from 'react';
import { Tile } from '../common/enums';
import { GameStatus } from './enums';
import { GameBoardType, GameMode } from '../common/pb';

export const allChains = [
  GameBoardType.LUXOR,
  GameBoardType.TOWER,
  GameBoardType.AMERICAN,
  GameBoardType.FESTIVAL,
  GameBoardType.WORLDWIDE,
  GameBoardType.CONTINENTAL,
  GameBoardType.IMPERIAL,
];

export const gameBoardTypeToCSSClassName = new Map([
  [GameBoardType.LUXOR, common.luxor],
  [GameBoardType.TOWER, common.tower],
  [GameBoardType.AMERICAN, common.american],
  [GameBoardType.FESTIVAL, common.festival],
  [GameBoardType.WORLDWIDE, common.worldwide],
  [GameBoardType.CONTINENTAL, common.continental],
  [GameBoardType.IMPERIAL, common.imperial],
  [GameBoardType.NOTHING, common.nothing],
  [GameBoardType.NOTHING_YET, common.nothingYet],
  [GameBoardType.CANT_PLAY_EVER, common.cantPlayEver],
  [GameBoardType.I_HAVE_THIS, common.iHaveThis],
  [GameBoardType.WILL_PUT_LONELY_TILE_DOWN, common.willPutLonelyTileDown],
  [GameBoardType.HAVE_NEIGHBORING_TILE_TOO, common.haveNeighboringTileToo],
  [GameBoardType.WILL_FORM_NEW_CHAIN, common.willFormNewChain],
  [GameBoardType.WILL_MERGE_CHAINS, common.willMergeChains],
  [GameBoardType.CANT_PLAY_NOW, common.cantPlayNow],
]);

export const gameBoardTypeToHotelInitial = new Map([
  [GameBoardType.LUXOR, 'L'],
  [GameBoardType.TOWER, 'T'],
  [GameBoardType.AMERICAN, 'A'],
  [GameBoardType.FESTIVAL, 'F'],
  [GameBoardType.WORLDWIDE, 'W'],
  [GameBoardType.CONTINENTAL, 'C'],
  [GameBoardType.IMPERIAL, 'I'],
]);

const gameBoardTypeToHotelName = new Map([
  [GameBoardType.LUXOR, 'Luxor'],
  [GameBoardType.TOWER, 'Tower'],
  [GameBoardType.AMERICAN, 'American'],
  [GameBoardType.FESTIVAL, 'Festival'],
  [GameBoardType.WORLDWIDE, 'Worldwide'],
  [GameBoardType.CONTINENTAL, 'Continental'],
  [GameBoardType.IMPERIAL, 'Imperial'],
]);

export const teamNumberToCSSClassName = new Map([
  [1, common.team1],
  [2, common.team2],
  [3, common.team3],
]);

const yTileNames = 'ABCDEFGHI';

export function getTileString(tile: number) {
  if (tile === Tile.Unknown) {
    return '?';
  } else {
    return `${Math.floor(tile / 9) + 1}${yTileNames[tile % 9]}`;
  }
}

let nextIDPostfix = 0;

export function getUniqueDOMElementID() {
  const id = `_${nextIDPostfix.toString(36)}`;
  nextIDPostfix++;
  return id;
}

export function getUsernameSpan(username: string) {
  return <span className={common.username}>{username}</span>;
}

export function getHotelNameSpan(chain: GameBoardType) {
  return <span className={gameBoardTypeToCSSClassName.get(chain)}>{gameBoardTypeToHotelName.get(chain)}</span>;
}

export const gameModeToString = new Map([
  [GameMode.SINGLES_1, 'Singles 1'],
  [GameMode.SINGLES_2, 'Singles 2'],
  [GameMode.SINGLES_3, 'Singles 3'],
  [GameMode.SINGLES_4, 'Singles 4'],
  [GameMode.SINGLES_5, 'Singles 5'],
  [GameMode.SINGLES_6, 'Singles 6'],
  [GameMode.TEAMS_2_VS_2, 'Teams 2 vs 2'],
  [GameMode.TEAMS_2_VS_2_VS_2, 'Teams 2 vs 2 vs 2'],
  [GameMode.TEAMS_3_VS_3, 'Teams 3 vs 3'],
]);

export const gameStatusToString = new Map([
  [GameStatus.SettingUp, 'Setting Up'],
  [GameStatus.InProgress, 'In Progress'],
  [GameStatus.Completed, 'Completed'],
]);

export function hackDoNotInterfereWithKeyboardShortcuts(event: React.KeyboardEvent<HTMLElement>) {
  event.stopPropagation();
}

export const tileRackKeyboardShortcutsDescription = 'Press 1-6 to move to a tile, ENTER to play it.';
export const selectChainKeyboardShortcutsDescription = 'Press 1-7 or L,T,A,F,W,C,I to move to a chain, ENTER to select it.';
export const disposeOfSharesKeyboardShortcutsDescription =
  'Press 1-7 for the corresponding button (left-to-right), ' +
  'K for Keep All, T for Trade ▲, Shift-T for Trade ▼, S for Sell ▲, Shift-S for Sell ▼, ' +
  '0 or 8 or O to move to the OK button, ENTER to press it.';
export const purchaseSharesKeyboardShortcutsDescription =
  'Press 1-7 or L,T,A,F,W,C,I to add a chain to the cart, ' +
  'Shift-1-7 or Shift-L,T,A,F,W,C,I to remove a chain from the cart, ' +
  'BACKSPACE or MINUS to remove the right-most chain from the cart, ' +
  'E or ASTERISK to toggle the End Game checkbox, ' +
  '0 or 8 or O to move to the OK button, ENTER to press it.';

export const allGameModes = [
  GameMode.SINGLES_1,
  GameMode.SINGLES_2,
  GameMode.SINGLES_3,
  GameMode.SINGLES_4,
  GameMode.SINGLES_5,
  GameMode.SINGLES_6,
  GameMode.TEAMS_2_VS_2,
  GameMode.TEAMS_2_VS_2_VS_2,
  GameMode.TEAMS_3_VS_3,
];
