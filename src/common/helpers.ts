export function getNewTileBag() {
    let tileBag: number[] = new Array(108);
    for (let i = 0; i < 108; i++) {
        tileBag[i] = i;
    }
    shuffle(tileBag);
    return tileBag;
}

// from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a: number[]) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

let neighboringTiles: number[][];
function initializeNeighboringTiles() {
    neighboringTiles = new Array(108);

    for (let tile = 0; tile < 108; tile++) {
        let possibilities: number[] = [];

        let x = Math.floor(tile / 9);
        let y = tile % 9;

        if (x > 0) {
            possibilities.push(tile - 9);
        }
        if (y > 0) {
            possibilities.push(tile - 1);
        }
        if (y < 8) {
            possibilities.push(tile + 1);
        }
        if (x < 11) {
            possibilities.push(tile + 9);
        }

        neighboringTiles[tile] = possibilities;
    }
}
initializeNeighboringTiles();

export function getNeighboringTiles(tile: number) {
    return neighboringTiles[tile];
}

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
        bonuses.push(new PlayerIDAndAmount(playerIDAndAmountArray[0].playerID, bonusPrice + bonusPrice / 2));
    } else if (playerIDAndAmountArray[0].amount === playerIDAndAmountArray[1].amount) {
        // in case of tie for largest shareholder, first and second bonuses are combined and divided equally between tying shareholders
        let numTying = 2;
        while (numTying < playerIDAndAmountArray.length && playerIDAndAmountArray[numTying].amount === playerIDAndAmountArray[0].amount) {
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
        while (numTying < playerIDAndAmountArray.length - 1 && playerIDAndAmountArray[numTying + 1].amount === playerIDAndAmountArray[1].amount) {
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

export function isASCII(string: string) {
    for (let i = 0; i < string.length; i++) {
        const char_code = string.charCodeAt(i);
        if (char_code < 32 || char_code > 126) {
            return false;
        }
    }
    return true;
}
