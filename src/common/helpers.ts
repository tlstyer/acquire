import { TileEnum } from './enums';
import { PB_GameMode, PB_MessageToClient, PB_MessageToClient_LoginLogout_ResponseCode } from './pb';

export function getNewTileBag() {
  const tileBag: number[] = new Array(108);
  for (let i = 0; i < 108; i++) {
    tileBag[i] = i;
  }
  shuffleArray(tileBag);
  return tileBag;
}

// from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
export function shuffleArray(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

export class NeighboringTile {
  constructor(public tile: number, public y: number, public x: number) {}
}

export const neighboringTilesLookup = (() => {
  const allTiles: NeighboringTile[] = new Array(108);
  let tile = 0;
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 9; y++) {
      allTiles[tile] = new NeighboringTile(tile, y, x);
      tile++;
    }
  }

  const result: NeighboringTile[][] = new Array(108);
  tile = 0;
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 9; y++) {
      const neighboringTiles: NeighboringTile[] = [];

      if (x > 0) {
        neighboringTiles.push(allTiles[tile - 9]);
      }
      if (y > 0) {
        neighboringTiles.push(allTiles[tile - 1]);
      }
      if (y < 8) {
        neighboringTiles.push(allTiles[tile + 1]);
      }
      if (x < 11) {
        neighboringTiles.push(allTiles[tile + 9]);
      }

      result[tile++] = neighboringTiles;
    }
  }

  return result;
})();

export function calculateBonuses(sharesOwned: number[], sharePrice: number) {
  const bonuses: PlayerIDAndAmount[] = [];

  const bonusPrice = sharePrice * 10;

  const playerIDAndAmountArray: PlayerIDAndAmount[] = [];
  for (let playerID = 0; playerID < sharesOwned.length; playerID++) {
    if (sharesOwned[playerID] > 0) {
      playerIDAndAmountArray.push(new PlayerIDAndAmount(playerID, sharesOwned[playerID]));
    }
  }
  playerIDAndAmountArray.sort((a, b) => {
    if (a.amount !== b.amount) {
      return b.amount - a.amount;
    }
    return a.playerID - b.playerID;
  });

  if (playerIDAndAmountArray.length === 0) {
    // if nobody has stock in this chain, then don't pay anybody (not going to happen in a normal game)
  } else if (playerIDAndAmountArray.length === 1) {
    // if only one player holds stock in defunct chain, he receives both bonuses
    bonuses.push(
      new PlayerIDAndAmount(playerIDAndAmountArray[0].playerID, bonusPrice + bonusPrice / 2),
    );
  } else if (playerIDAndAmountArray[0].amount === playerIDAndAmountArray[1].amount) {
    // in case of tie for largest shareholder, first and second bonuses are combined and divided equally between tying shareholders
    let numTying = 2;
    while (
      numTying < playerIDAndAmountArray.length &&
      playerIDAndAmountArray[numTying].amount === playerIDAndAmountArray[0].amount
    ) {
      numTying++;
    }
    const bonus = Math.ceil((bonusPrice + bonusPrice / 2) / numTying);
    for (let i = 0; i < numTying; i++) {
      bonuses.push(new PlayerIDAndAmount(playerIDAndAmountArray[i].playerID, bonus));
    }
  } else {
    // pay largest shareholder
    bonuses.push(new PlayerIDAndAmount(playerIDAndAmountArray[0].playerID, bonusPrice));

    // see if there's a tie for 2nd place
    let numTying = 1;
    while (
      numTying < playerIDAndAmountArray.length - 1 &&
      playerIDAndAmountArray[numTying + 1].amount === playerIDAndAmountArray[1].amount
    ) {
      numTying++;
    }

    if (numTying === 1) {
      // stock market pays compensatory bonuses to two largest shareholders in defunct chain
      bonuses.push(new PlayerIDAndAmount(playerIDAndAmountArray[1].playerID, bonusPrice / 2));
    } else {
      // in case of tie for second largest shareholder, second bonus is divided equally between tying players
      const bonus = Math.ceil(bonusPrice / 2 / numTying);
      for (let i = 1; i <= numTying; i++) {
        bonuses.push(new PlayerIDAndAmount(playerIDAndAmountArray[i].playerID, bonus));
      }
    }
  }

  return bonuses;
}

export class PlayerIDAndAmount {
  constructor(public playerID: number, public amount: number) {}
}

export function isASCII(str: string) {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 32 || charCode > 126) {
      return false;
    }
  }
  return true;
}

export function isValidUsername(username: string) {
  return username.length > 0 && username.length <= 32 && isASCII(username);
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export const gameModeToNumPlayers = new Map([
  [PB_GameMode.SINGLES_1, 1],
  [PB_GameMode.SINGLES_2, 2],
  [PB_GameMode.SINGLES_3, 3],
  [PB_GameMode.SINGLES_4, 4],
  [PB_GameMode.SINGLES_5, 5],
  [PB_GameMode.SINGLES_6, 6],
  [PB_GameMode.TEAMS_2_VS_2, 4],
  [PB_GameMode.TEAMS_2_VS_2_VS_2, 6],
  [PB_GameMode.TEAMS_3_VS_3, 6],
]);

export const gameModeToTeamSize = new Map([
  [PB_GameMode.SINGLES_1, 1],
  [PB_GameMode.SINGLES_2, 1],
  [PB_GameMode.SINGLES_3, 1],
  [PB_GameMode.SINGLES_4, 1],
  [PB_GameMode.SINGLES_5, 1],
  [PB_GameMode.SINGLES_6, 1],
  [PB_GameMode.TEAMS_2_VS_2, 2],
  [PB_GameMode.TEAMS_2_VS_2_VS_2, 2],
  [PB_GameMode.TEAMS_3_VS_3, 3],
]);

export function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function getValueOfKey(obj: any) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }
}

export function createLoginLogoutMessage(
  responseCode: PB_MessageToClient_LoginLogout_ResponseCode,
  username?: string,
  userID?: number,
  token?: string,
) {
  return PB_MessageToClient.create({
    loginLogout: {
      responseCode,
      username: username !== undefined ? username : '',
      userId: userID !== undefined ? userID : 0,
      token: token !== undefined ? token : '',
    },
  });
}

export function cleanUpWhitespaceInUsername(username: string) {
  return username.replace(/\s+/g, ' ').trim();
}

export function concatenateUint8Arrays(arrays: Uint8Array[]) {
  if (arrays.length === 1) {
    return arrays[0];
  }

  const totalLength = arrays.reduce((soFar, array) => soFar + array.length, 0);
  const result = new Uint8Array(totalLength);

  let targetOffset = 0;
  for (const array of arrays) {
    result.set(array, targetOffset);
    targetOffset += array.length;
  }

  return result;
}

export const yTileNames = 'ABCDEFGHI';

export function toTileString(tile: number) {
  if (tile === TileEnum.Unknown) {
    return '?';
  } else {
    const y = tile % 9;
    const x = (tile - y) / 9;
    return `${x + 1}${yTileNames[y]}`;
  }
}
