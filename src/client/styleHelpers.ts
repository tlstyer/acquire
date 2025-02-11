import { PB_GameBoardType } from '../common/pb.js';
import styles from './App.module.css';

export const gameBoardTypeToCSSClassName = new Map([
  [PB_GameBoardType.LUXOR, styles.colorLuxor],
  [PB_GameBoardType.TOWER, styles.colorTower],
  [PB_GameBoardType.AMERICAN, styles.colorAmerican],
  [PB_GameBoardType.FESTIVAL, styles.colorFestival],
  [PB_GameBoardType.WORLDWIDE, styles.colorWorldwide],
  [PB_GameBoardType.CONTINENTAL, styles.colorContinental],
  [PB_GameBoardType.IMPERIAL, styles.colorImperial],
  [PB_GameBoardType.NOTHING, styles.colorNothing],
  [PB_GameBoardType.NOTHING_YET, styles.colorNothingYet],
  [PB_GameBoardType.CANT_PLAY_EVER, styles.colorCantPlayEver],
  [PB_GameBoardType.I_HAVE_THIS, styles.colorIHaveThis],
  [PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN, styles.colorWillPutLonelyTileDown],
  [PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO, styles.colorHaveNeighboringTileToo],
  [PB_GameBoardType.WILL_FORM_NEW_CHAIN, styles.colorWillFormNewChain],
  [PB_GameBoardType.WILL_MERGE_CHAINS, styles.colorWillMergeChains],
  [PB_GameBoardType.CANT_PLAY_NOW, styles.colorCantPlayNow],
]);

export const teamNumberToCSSClassName = new Map([
  [1, styles.colorTeam1],
  [2, styles.colorTeam2],
  [3, styles.colorTeam3],
]);
