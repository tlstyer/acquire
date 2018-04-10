import { GameBoardType, Tile } from '../enums';
import * as colors from './colors.css';

const gameBoardTypeToColorsStyleLookup: { [key: number]: string } = {
    [GameBoardType.Luxor]: colors.luxor,
    [GameBoardType.Tower]: colors.tower,
    [GameBoardType.American]: colors.american,
    [GameBoardType.Festival]: colors.festival,
    [GameBoardType.Worldwide]: colors.worldwide,
    [GameBoardType.Continental]: colors.continental,
    [GameBoardType.Imperial]: colors.imperial,
    [GameBoardType.Nothing]: colors.nothing,
    [GameBoardType.NothingYet]: colors.nothingYet,
    [GameBoardType.CantPlayEver]: colors.cantPlayEver,
    [GameBoardType.IHaveThis]: colors.iHaveThis,
    [GameBoardType.WillPutLonelyTileDown]: colors.willPutLonelyTileDown,
    [GameBoardType.HaveNeighboringTileToo]: colors.haveNeighboringTileToo,
    [GameBoardType.WillFormNewChain]: colors.willFormNewChain,
    [GameBoardType.WillMergeChains]: colors.willMergeChains,
    [GameBoardType.CantPlayNow]: colors.cantPlayNow,
};

export function getCssStyleForGameBoardType(gameBoardType: GameBoardType) {
    return gameBoardTypeToColorsStyleLookup[gameBoardType];
}

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

const hotelInitials: { [key: number]: string } = {
    [GameBoardType.Luxor]: 'L',
    [GameBoardType.Tower]: 'T',
    [GameBoardType.American]: 'A',
    [GameBoardType.Festival]: 'F',
    [GameBoardType.Worldwide]: 'W',
    [GameBoardType.Continental]: 'C',
    [GameBoardType.Imperial]: 'I',
};

export function getHotelInitial(chain: GameBoardType) {
    return hotelInitials[chain];
}
