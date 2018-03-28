import {
    defaultTileRacks,
    defaultTileRack,
    defaultTileRackTypesList,
    defaultTileRackTypes,
    defaultGameBoard,
    defaultScoreBoard,
    defaultScoreBoardRow,
    defaultScoreBoardAvailable,
    defaultScoreBoardChainSize,
    defaultScoreBoardPrice,
} from './defaults';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { UserInputError } from './error';
import { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';

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

        let newActions = currentAction.execute(parameters);
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
                let x = Math.floor(tile / 9);
                let y = tile % 9;

                let borderTiles: number[] = [];
                let borderTypes: GameBoardType[] = [];
                if (x > 0) {
                    let neighbor = tile - 9;
                    borderTiles.push(neighbor);
                    borderTypes.push(this.gameBoard.get(neighbor, 0));
                }
                if (x < 11) {
                    let neighbor = tile + 9;
                    borderTiles.push(neighbor);
                    borderTypes.push(this.gameBoard.get(neighbor, 0));
                }
                if (y > 0) {
                    let neighbor = tile - 1;
                    borderTiles.push(neighbor);
                    borderTypes.push(this.gameBoard.get(neighbor, 0));
                }
                if (y < 8) {
                    let neighbor = tile + 1;
                    borderTiles.push(neighbor);
                    borderTypes.push(this.gameBoard.get(neighbor, 0));
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

            let possibilities: number[] = [];
            let x = Math.floor(t / 9);
            let y = t % 9;
            if (x > 0) {
                possibilities.push(t - 9);
            }
            if (x < 11) {
                possibilities.push(t + 9);
            }
            if (y > 0) {
                possibilities.push(t - 1);
            }
            if (y < 8) {
                possibilities.push(t + 1);
            }

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

    adjustPlayerScoreSheetCell(playerID: number, scoreBoardIndex: ScoreBoardIndex, change: number) {
        let value = this.scoreBoard.getIn([playerID, scoreBoardIndex], 0);
        this.scoreBoard = this.scoreBoard.setIn([playerID, scoreBoardIndex], value + change);
    }

    setChainSize(scoreBoardIndex: ScoreBoardIndex, size: number) {
        this.scoreBoardChainSize = this.scoreBoardChainSize.set(scoreBoardIndex, size);
    }

    getCurrentMoveData() {
        if (this.currentMoveData === null) {
            this.currentMoveData = new MoveData(this);
        }
        return this.currentMoveData;
    }

    endCurrentMove() {
        if (this.currentMoveData !== null) {
            this.currentMoveData.endMove();
            this.moveDataHistory.push(this.currentMoveData);
            this.currentMoveData = null;
        }
    }
}

export class MoveData {
    playerID: number = -1;
    gameAction: GameAction = GameAction.StartGame;
    gameActionParameters: any[] = [];
    newPlayerKnownTiles: number[][];
    newWatcherKnownTiles: number[] = [];
    gameHistoryMessages: GameHistoryMessageData[] = [];

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
    }
}

export class GameHistoryMessageData {
    constructor(public gameHistoryMessage: GameHistoryMessage, public playerID: number | null, public parameters: any[]) {}
}
