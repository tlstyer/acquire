import { PB_GameBoardType } from '../common/pb';

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
