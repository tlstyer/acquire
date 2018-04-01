import {
    defaultGameBoard,
    defaultScoreBoard,
    defaultScoreBoardAvailable,
    defaultScoreBoardChainSize,
    defaultScoreBoardPrice,
    defaultScoreBoardRow,
    defaultTileRack,
    defaultTileRacks,
    defaultTileRackTypes,
    defaultTileRackTypesList,
} from './defaults';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { UserInputError } from './error';
import { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';
import { calculateBonuses, getNeighboringTiles } from './helpers';

export class Game {
    nextTileBagIndex: number = 0;
    tileToTileBagIndex: { [key: number]: number } = {};
    gameBoardTypeCounts: number[];
    protected currentMoveData: MoveData | null = null;
    moveDataHistory: MoveData[] = [];
    gameActionStack: ActionBase[] = [];
    numTurnsWithoutPlayedTiles: number = 0;

    tileRacks = defaultTileRacks;
    tileRackTypes = defaultTileRackTypesList;
    gameBoard = defaultGameBoard;
    scoreBoard = defaultScoreBoard;
    scoreBoardAvailable = defaultScoreBoardAvailable;
    scoreBoardChainSize = defaultScoreBoardChainSize;
    scoreBoardPrice = defaultScoreBoardPrice;

    constructor(public tileBag: number[], public userIDs: number[], starterUserID: number, public myUserID: number | null) {
        // initialize this.tileToTileBagIndex
        for (let tileBagIndex = 0; tileBagIndex < tileBag.length; tileBagIndex++) {
            this.tileToTileBagIndex[tileBag[tileBagIndex]] = tileBagIndex;
        }

        // initialize this.gameBoardTypeCounts
        this.gameBoardTypeCounts = new Array(GameBoardType.Max);
        for (let i = 0; i < GameBoardType.Max; i++) {
            this.gameBoardTypeCounts[i] = 0;
        }
        this.gameBoardTypeCounts[GameBoardType.Nothing] = 108;

        // initialize this.gameActionStack
        this.gameActionStack.push(new ActionStartGame(this, userIDs.indexOf(starterUserID)));

        // initialize this.tileRacks, this.tileRackTypes, this.scoreBoard
        for (let playerID = 0; playerID < userIDs.length; playerID++) {
            this.tileRacks = this.tileRacks.push(defaultTileRack);
            this.tileRackTypes = this.tileRacks.push(defaultTileRackTypes);
            this.scoreBoard = this.scoreBoard.push(defaultScoreBoardRow);
        }
    }

    doGameAction(userID: number, moveIndex: number, parameters: any[]) {
        let playerID = this.userIDs.indexOf(userID);
        let currentAction = this.gameActionStack[this.gameActionStack.length - 1];

        if (playerID !== currentAction.playerID) {
            throw new UserInputError('player cannot play right now');
        }
        if (moveIndex !== this.moveDataHistory.length) {
            throw new UserInputError('incorrect move index');
        }

        let newActions: ActionBase[] | null = currentAction.execute(parameters);
        this.getCurrentMoveData().setGameAction(playerID, currentAction.gameAction, parameters);

        while (newActions !== null) {
            this.gameActionStack.pop();
            this.gameActionStack.push(...newActions.reverse());
            currentAction = this.gameActionStack[this.gameActionStack.length - 1];
            newActions = currentAction.prepare();
        }

        this.endCurrentMove();
    }

    drawTiles(playerID: number) {
        let isMe = this.userIDs[playerID] === this.myUserID;

        for (let i = 0; i < 6; i++) {
            if (this.tileRacks.getIn([playerID, i], 0) !== null) {
                continue;
            }

            if (this.nextTileBagIndex >= this.tileBag.length) {
                if (this.tileBag.length < 108) {
                    throw new Error('missing tiles from tile bag');
                }
                return;
            }
            let tile = this.tileBag[this.nextTileBagIndex++];

            this.tileRacks = this.tileRacks.setIn([playerID, i], tile);
            this.getCurrentMoveData().addNewPlayerKnownTile(tile, playerID);
            if (isMe) {
                this.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.DrewTile, playerID, [tile]));
            }

            if (this.nextTileBagIndex === 108) {
                this.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.DrewLastTile, playerID, []));
            }
        }
    }

    removeTile(playerID: number, tileIndex: number) {
        this.tileRacks = this.tileRacks.setIn([playerID, tileIndex], null);
        this.tileRackTypes = this.tileRackTypes.setIn([playerID, tileIndex], null);
    }

    determineTileRackTypesForEverybody() {
        for (let playerID = 0; playerID < this.userIDs.length; playerID++) {
            this.determineTileRackTypesForPlayer(playerID);
        }
    }

    determineTileRackTypesForPlayer(playerID: number) {
        let tileTypes: (GameBoardType | null)[] = [];
        let lonelyTileIndexes: number[] = [];
        let lonelyTileBorderTiles: { [key: number]: boolean } = {};

        let canStartNewChain: boolean = false;
        for (let i = 0; i <= GameBoardType.Imperial; i++) {
            if (this.gameBoardTypeCounts[i] === 0) {
                canStartNewChain = true;
                break;
            }
        }

        for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
            let tile = this.tileRacks.getIn([playerID, tileIndex], 0);
            let tileType = null;

            if (tile !== null) {
                let borderTiles: number[] = [];
                let borderTypes: GameBoardType[] = [];
                const neighboringTiles = getNeighboringTiles(tile);
                for (let i = 0; i < neighboringTiles.length; i++) {
                    let neighboringTile = neighboringTiles[i];
                    borderTiles.push(neighboringTile);
                    borderTypes.push(this.gameBoard.get(neighboringTile, 0));
                }

                borderTypes = borderTypes.filter((type, index) => {
                    if (type === GameBoardType.Nothing || type === GameBoardType.CantPlayEver) {
                        return false;
                    }
                    if (borderTypes.indexOf(type) !== index) {
                        // exclude this as it is already in the array
                        return false;
                    }
                    return true;
                });
                if (borderTypes.length > 1) {
                    borderTypes = borderTypes.filter(type => type !== GameBoardType.NothingYet);
                }

                if (borderTypes.length === 0) {
                    tileType = GameBoardType.WillPutLonelyTileDown;
                    lonelyTileIndexes.push(tileIndex);
                    for (let i = 0; i < borderTiles.length; i++) {
                        lonelyTileBorderTiles[borderTiles[i]] = true;
                    }
                } else if (borderTypes.length === 1) {
                    if (borderTypes.indexOf(GameBoardType.NothingYet) !== -1) {
                        if (canStartNewChain) {
                            tileType = GameBoardType.WillFormNewChain;
                        } else {
                            tileType = GameBoardType.CantPlayNow;
                        }
                    } else {
                        tileType = borderTypes[0];
                    }
                } else {
                    let safeCount = 0;
                    for (let i = 0; i < borderTypes.length; i++) {
                        if (this.gameBoardTypeCounts[borderTypes[i]] >= 11) {
                            safeCount++;
                        }
                    }

                    if (safeCount >= 2) {
                        tileType = GameBoardType.CantPlayEver;
                    } else {
                        tileType = GameBoardType.WillMergeChains;
                    }
                }
            }

            tileTypes.push(tileType);
        }

        if (canStartNewChain) {
            for (let i = 0; i < lonelyTileIndexes.length; i++) {
                let tileIndex = lonelyTileIndexes[i];

                let tileType = tileTypes[tileIndex];
                if (tileType === GameBoardType.WillPutLonelyTileDown) {
                    let tile = this.tileRacks.getIn([playerID, tileIndex], 0);
                    if (tile !== null && lonelyTileBorderTiles[tile] === true) {
                        tileTypes[tileIndex] = GameBoardType.HaveNeighboringTileToo;
                    }
                }
            }
        }

        let tileRackTypes = this.tileRackTypes.asMutable();
        for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
            tileRackTypes.setIn([playerID, tileIndex], tileTypes[tileIndex]);
        }
        this.tileRackTypes = tileRackTypes.asImmutable();
    }

    setGameBoardPosition(tile: number, gameBoardType: GameBoardType) {
        this.gameBoardTypeCounts[this.gameBoard.get(tile, 0)]--;
        this.gameBoard = this.gameBoard.set(tile, gameBoardType);
        this.gameBoardTypeCounts[gameBoardType]++;
    }

    fillCells(tile: number, gameBoardType: GameBoardType) {
        let pending: number[] = [tile];
        let found: { [key: number]: boolean } = {};
        found[tile] = true;
        const excludedTypes: { [key: number]: boolean } = {};
        excludedTypes[GameBoardType.Nothing] = true;
        excludedTypes[GameBoardType.CantPlayEver] = true;
        excludedTypes[gameBoardType] = true;

        this.gameBoard = this.gameBoard.asMutable();

        let t: number | undefined;
        while ((t = pending.pop()) !== undefined) {
            this.setGameBoardPosition(t, gameBoardType);

            const possibilities = getNeighboringTiles(t);

            for (let i = 0; i < possibilities.length; i++) {
                let possibility = possibilities[i];
                if (found[possibility] !== true && excludedTypes[this.gameBoard.get(possibility, 0)] !== true) {
                    pending.push(possibility);
                    found[possibility] = true;
                }
            }
        }

        this.gameBoard = this.gameBoard.asImmutable();
    }

    getScoreBoardColumnArray(scoreBoardIndex: GameBoardType | ScoreBoardIndex) {
        const column: number[] = new Array(this.userIDs.length);
        for (let playerID = 0; playerID < this.userIDs.length; playerID++) {
            column[playerID] = this.scoreBoard.getIn([playerID, scoreBoardIndex], 0);
        }
        return column;
    }

    adjustPlayerScoreBoardRow(playerID: number, adjustments: [GameBoardType | ScoreBoardIndex, number][]) {
        let scoreBoard = this.scoreBoard.asMutable();
        let scoreBoardAvailable = this.scoreBoardAvailable.asMutable();

        for (let i = 0; i < adjustments.length; i++) {
            const [scoreBoardIndex, change] = adjustments[i];

            let value = scoreBoard.getIn([playerID, scoreBoardIndex], 0);
            scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], value + change);

            if (scoreBoardIndex <= ScoreBoardIndex.Imperial) {
                let value = scoreBoardAvailable.get(scoreBoardIndex, 0);
                scoreBoardAvailable = scoreBoardAvailable.set(scoreBoardIndex, value - change);
            }
        }

        this.scoreBoard = scoreBoard.asImmutable();
        this.scoreBoardAvailable = scoreBoardAvailable.asImmutable();
    }

    adjustScoreBoardColumn(scoreBoardIndex: ScoreBoardIndex, adjustments: number[]) {
        let scoreBoard = this.scoreBoard.asMutable();

        for (let playerID = 0; playerID < adjustments.length; playerID++) {
            let change = adjustments[playerID];
            if (change !== 0) {
                let value = scoreBoard.getIn([playerID, scoreBoardIndex], 0);
                scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], value + change);
            }
        }

        this.scoreBoard = scoreBoard.asImmutable();
    }

    setScoreBoardColumn(scoreBoardIndex: ScoreBoardIndex, values: number[]) {
        let scoreBoard = this.scoreBoard.asMutable();

        for (let playerID = 0; playerID < values.length; playerID++) {
            scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], values[playerID]);
        }

        this.scoreBoard = scoreBoard.asImmutable();
    }

    setChainSize(scoreBoardIndex: GameBoardType | ScoreBoardIndex, size: number) {
        this.scoreBoardChainSize = this.scoreBoardChainSize.set(scoreBoardIndex, size);

        let price = 0;
        if (size > 0) {
            if (size < 11) {
                price = Math.min(size, 6);
            } else {
                price = Math.min(Math.floor((size - 1) / 10) + 6, 10);
            }
            if (scoreBoardIndex >= ScoreBoardIndex.American) {
                price++;
            }
            if (scoreBoardIndex >= ScoreBoardIndex.Continental) {
                price++;
            }
        }

        this.scoreBoardPrice = this.scoreBoardPrice.set(scoreBoardIndex, price);
    }

    updateNetWorths() {
        const netWorths = this.getScoreBoardColumnArray(ScoreBoardIndex.Cash);

        const prices = this.scoreBoardPrice.toArray();
        for (let chain = 0; chain < prices.length; chain++) {
            const price = prices[chain];
            if (price > 0) {
                const sharesOwned = this.getScoreBoardColumnArray(chain);
                for (let playerID = 0; playerID < sharesOwned.length; playerID++) {
                    const numShares = sharesOwned[playerID];
                    netWorths[playerID] += numShares * price;
                }
                if (this.gameBoardTypeCounts[chain] > 0) {
                    const bonuses = calculateBonuses(sharesOwned, price);
                    for (let i = 0; i < bonuses.length; i++) {
                        const bonus = bonuses[i];
                        netWorths[bonus.playerID] += bonus.amount;
                    }
                }
            }
        }

        this.setScoreBoardColumn(ScoreBoardIndex.Net, netWorths);
    }

    getCurrentMoveData() {
        if (this.currentMoveData === null) {
            this.currentMoveData = new MoveData(this);
        }
        return this.currentMoveData;
    }

    endCurrentMove() {
        this.updateNetWorths();

        this.currentMoveData = this.getCurrentMoveData();
        this.currentMoveData.endMove();
        this.moveDataHistory.push(this.currentMoveData);
        this.currentMoveData = null;
    }
}

export class MoveData {
    playerID: number = -1;
    gameAction: GameAction = GameAction.StartGame;
    gameActionParameters: any[] = [];
    newPlayerKnownTiles: number[][];
    newWatcherKnownTiles: number[] = [];
    gameHistoryMessages: GameHistoryMessageData[] = [];
    nextGameAction: ActionBase;

    tileRacks = defaultTileRacks;
    tileRackTypes = defaultTileRackTypesList;
    gameBoard = defaultGameBoard;
    scoreBoard = defaultScoreBoard;
    scoreBoardAvailable = defaultScoreBoardAvailable;
    scoreBoardChainSize = defaultScoreBoardChainSize;
    scoreBoardPrice = defaultScoreBoardPrice;

    constructor(public game: Game) {
        this.newPlayerKnownTiles = new Array(game.userIDs.length);
        for (let playerID = 0; playerID < game.userIDs.length; playerID++) {
            this.newPlayerKnownTiles[playerID] = [];
        }

        // assign something to this.nextGameAction so it gets set in the constructor
        this.nextGameAction = game.gameActionStack[game.gameActionStack.length - 1];
    }

    setGameAction(playerID: number, gameAction: GameAction, parameters: any[]) {
        this.playerID = playerID;
        this.gameAction = gameAction;
        this.gameActionParameters = parameters;
    }

    addNewPlayerKnownTile(tile: number, playerID: number) {
        this.newPlayerKnownTiles[playerID].push(tile);
    }

    addNewGloballyKnownTile(tile: number, playerIDWhoAlreadyKnows?: number) {
        for (let playerID = 0; playerID < this.newPlayerKnownTiles.length; playerID++) {
            if (playerID !== playerIDWhoAlreadyKnows) {
                this.newPlayerKnownTiles[playerID].push(tile);
            }
        }

        this.newWatcherKnownTiles.push(tile);
    }

    addGameHistoryMessage(gameHistoryMessageData: GameHistoryMessageData) {
        this.gameHistoryMessages.push(gameHistoryMessageData);
    }

    endMove() {
        this.tileRacks = this.game.tileRacks;
        this.tileRackTypes = this.game.tileRackTypes;
        this.gameBoard = this.game.gameBoard;
        this.scoreBoard = this.game.scoreBoard;
        this.scoreBoardAvailable = this.game.scoreBoardAvailable;
        this.scoreBoardChainSize = this.game.scoreBoardChainSize;
        this.scoreBoardPrice = this.game.scoreBoardPrice;
        this.nextGameAction = this.game.gameActionStack[this.game.gameActionStack.length - 1];
    }
}

export class GameHistoryMessageData {
    constructor(public gameHistoryMessage: GameHistoryMessage, public playerID: number | null, public parameters: any[]) {}
}
