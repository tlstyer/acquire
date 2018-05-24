import * as React from 'react';
import { GameBoardType, GameMode, Tile } from '../common/enums';
import * as common from './common.css';
import { GameStatus } from './enums';

export const allChains = [0, 1, 2, 3, 4, 5, 6];

export const gameBoardTypeToCSSClassName: { [key: number]: string } = {
    [GameBoardType.Luxor]: common.luxor,
    [GameBoardType.Tower]: common.tower,
    [GameBoardType.American]: common.american,
    [GameBoardType.Festival]: common.festival,
    [GameBoardType.Worldwide]: common.worldwide,
    [GameBoardType.Continental]: common.continental,
    [GameBoardType.Imperial]: common.imperial,
    [GameBoardType.Nothing]: common.nothing,
    [GameBoardType.NothingYet]: common.nothingYet,
    [GameBoardType.CantPlayEver]: common.cantPlayEver,
    [GameBoardType.IHaveThis]: common.iHaveThis,
    [GameBoardType.WillPutLonelyTileDown]: common.willPutLonelyTileDown,
    [GameBoardType.HaveNeighboringTileToo]: common.haveNeighboringTileToo,
    [GameBoardType.WillFormNewChain]: common.willFormNewChain,
    [GameBoardType.WillMergeChains]: common.willMergeChains,
    [GameBoardType.CantPlayNow]: common.cantPlayNow,
};

export const gameBoardTypeToHotelInitial: { [key: number]: string } = {
    [GameBoardType.Luxor]: 'L',
    [GameBoardType.Tower]: 'T',
    [GameBoardType.American]: 'A',
    [GameBoardType.Festival]: 'F',
    [GameBoardType.Worldwide]: 'W',
    [GameBoardType.Continental]: 'C',
    [GameBoardType.Imperial]: 'I',
};

const gameBoardTypeToHotelName: { [key: number]: string } = {
    [GameBoardType.Luxor]: 'Luxor',
    [GameBoardType.Tower]: 'Tower',
    [GameBoardType.American]: 'American',
    [GameBoardType.Festival]: 'Festival',
    [GameBoardType.Worldwide]: 'Worldwide',
    [GameBoardType.Continental]: 'Continental',
    [GameBoardType.Imperial]: 'Imperial',
};

export const teamNumberToCSSClassName: { [key: number]: string } = {
    1: common.team1,
    2: common.team2,
    3: common.team3,
};

const yTileNames = 'ABCDEFGHI';

export function getTileString(tile: number) {
    if (tile === Tile.Unknown) {
        return '?';
    } else {
        return `${Math.floor(tile / 9) + 1}${yTileNames[tile % 9]}`;
    }
}

let nextIDPostfix = 0;

export function getUniqueHtmlID() {
    const id = '_' + nextIDPostfix.toString(36);
    nextIDPostfix++;
    return id;
}

export function getUsernameSpan(username: string) {
    return <span className={common.username}>{username}</span>;
}

export function getHotelNameSpan(chain: GameBoardType) {
    return <span className={gameBoardTypeToCSSClassName[chain]}>{gameBoardTypeToHotelName[chain]}</span>;
}

export const gameModeToString: { [key: number]: string } = {
    [GameMode.Singles1]: 'Singles 1',
    [GameMode.Singles2]: 'Singles 2',
    [GameMode.Singles3]: 'Singles 3',
    [GameMode.Singles4]: 'Singles 4',
    [GameMode.Singles5]: 'Singles 5',
    [GameMode.Singles6]: 'Singles 6',
    [GameMode.Teams2vs2]: 'Teams 2 vs 2',
    [GameMode.Teams2vs2vs2]: 'Teams 2 vs 2 vs 2',
    [GameMode.Teams3vs3]: 'Teams 3 vs 3',
};

export const gameStatusToString: { [key: number]: string } = {
    [GameStatus.SettingUp]: 'Setting Up',
    [GameStatus.InProgress]: 'In Progress',
    [GameStatus.Completed]: 'Completed',
};

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

export const allGameModes: GameMode[] = [
    GameMode.Singles1,
    GameMode.Singles2,
    GameMode.Singles3,
    GameMode.Singles4,
    GameMode.Singles5,
    GameMode.Singles6,
    GameMode.Teams2vs2,
    GameMode.Teams2vs2vs2,
    GameMode.Teams3vs3,
];
