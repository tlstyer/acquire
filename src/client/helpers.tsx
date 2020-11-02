import * as React from 'react';
import { TileEnum } from '../common/enums';
import { PB_GameBoardType, PB_GameMode } from '../common/pb';
import * as common from './common.scss';
import { GameStatusEnum } from './enums';

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
  [PB_GameBoardType.LUXOR, common.luxor],
  [PB_GameBoardType.TOWER, common.tower],
  [PB_GameBoardType.AMERICAN, common.american],
  [PB_GameBoardType.FESTIVAL, common.festival],
  [PB_GameBoardType.WORLDWIDE, common.worldwide],
  [PB_GameBoardType.CONTINENTAL, common.continental],
  [PB_GameBoardType.IMPERIAL, common.imperial],
  [PB_GameBoardType.NOTHING, common.nothing],
  [PB_GameBoardType.NOTHING_YET, common.nothingYet],
  [PB_GameBoardType.CANT_PLAY_EVER, common.cantPlayEver],
  [PB_GameBoardType.I_HAVE_THIS, common.iHaveThis],
  [PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN, common.willPutLonelyTileDown],
  [PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO, common.haveNeighboringTileToo],
  [PB_GameBoardType.WILL_FORM_NEW_CHAIN, common.willFormNewChain],
  [PB_GameBoardType.WILL_MERGE_CHAINS, common.willMergeChains],
  [PB_GameBoardType.CANT_PLAY_NOW, common.cantPlayNow],
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

const gameBoardTypeToHotelName = new Map([
  [PB_GameBoardType.LUXOR, 'Luxor'],
  [PB_GameBoardType.TOWER, 'Tower'],
  [PB_GameBoardType.AMERICAN, 'American'],
  [PB_GameBoardType.FESTIVAL, 'Festival'],
  [PB_GameBoardType.WORLDWIDE, 'Worldwide'],
  [PB_GameBoardType.CONTINENTAL, 'Continental'],
  [PB_GameBoardType.IMPERIAL, 'Imperial'],
]);

export const teamNumberToCSSClassName = new Map([
  [1, common.team1],
  [2, common.team2],
  [3, common.team3],
]);

const yTileNames = 'ABCDEFGHI';

export function getTileString(tile: number) {
  if (tile === TileEnum.Unknown) {
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

export function getHotelNameSpan(chain: PB_GameBoardType) {
  return <span className={gameBoardTypeToCSSClassName.get(chain)}>{gameBoardTypeToHotelName.get(chain)}</span>;
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
  [GameStatusEnum.SettingUp, 'Setting Up'],
  [GameStatusEnum.InProgress, 'In Progress'],
  [GameStatusEnum.Completed, 'Completed'],
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
