import { GameBoardType } from '../enums';
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
