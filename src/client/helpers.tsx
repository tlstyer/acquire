import * as React from 'react';

import { GameBoardType, Tile } from '../common/enums';
import * as common from './common.css';

export const chains = [0, 1, 2, 3, 4, 5, 6];

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

const yTileNames = 'ABCDEFGHI';

export function getTileString(tile: number) {
    if (tile === Tile.Unknown) {
        return '?';
    } else {
        let x = Math.floor(tile / 9) + 1;
        let y = yTileNames[tile % 9];
        return x + y;
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
