import { GameAction, GameBoardType, GameHistoryMessage } from './enums';
import { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';

export class Game {
    nextTileBagIndex: number = 0;
    tileToTileBagIndex: Map<number, number> = new Map();
    tileRacks: (number | null)[][];
    gameBoard: GameBoardType[][];
    protected currentMoveData: MoveData | null = null;
    moveDataHistory: MoveData[] = [];
    gameActionStack: ActionBase[] = [];

    constructor(public tileBag: number[], public userIDs: number[], starterUserID: number, public myUserID: number | null) {
        // initialize this.tileToTileBagIndex
        for (let tileBagIndex = 0; tileBagIndex < tileBag.length; tileBagIndex++) {
            this.tileToTileBagIndex.set(tileBag[tileBagIndex], tileBagIndex);
        }

        // initialize this.tileRacks
        this.tileRacks = new Array(userIDs.length);
        for (let playerID = 0; playerID < userIDs.length; playerID++) {
            let tileRack = new Array(6);
            for (let i = 0; i < 6; i++) {
                tileRack[i] = null;
            }
            this.tileRacks[playerID] = tileRack;
        }

        // initialize this.gameBoard
        this.gameBoard = new Array(9);
        for (let y = 0; y < 9; y++) {
            let row = new Array(12);
            for (let x = 0; x < 12; x++) {
                row[x] = GameBoardType.Nothing;
            }
            this.gameBoard[y] = row;
        }

        // initialize this.gameActionStack
        this.gameActionStack.push(new ActionStartGame(this, userIDs.indexOf(starterUserID)));
    }

    doGameAction(userID: number, moveIndex: number, parameters: any[]) {
        let playerID = this.userIDs.indexOf(userID);
        let currentAction = this.gameActionStack[this.gameActionStack.length - 1];

        if (playerID === currentAction.playerID && moveIndex === this.moveDataHistory.length) {
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
    }

    drawTiles(playerIndex: number) {
        let isMe = this.userIDs[playerIndex] === this.myUserID;

        for (let i = 0; i < 6; i++) {
            if (this.tileRacks[playerIndex][i] !== null) {
                continue;
            }

            if (this.nextTileBagIndex >= this.tileBag.length) {
                return;
            }
            let tile = this.tileBag[this.nextTileBagIndex++];

            this.tileRacks[playerIndex][i] = tile;
            this.getCurrentMoveData().addNewPlayerKnownTile(tile, playerIndex);
            if (isMe) {
                this.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.DrewTile, playerIndex, [tile]));
            }
        }
    }

    setGameBoardPosition(tile: number, gameBoardType: GameBoardType) {
        let x = Math.floor(tile / 9);
        let y = tile % 9;
        this.gameBoard[y][x] = gameBoardType;
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
    gameBoard: GameBoardType[][] = [];

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

    addNewPlayerKnownTile(tile: number, playerIndex: number) {
        this.newPlayerKnownTiles[playerIndex].push(tile);
    }

    addNewGloballyKnownTile(tile: number, playerIndexWhoAlreadyKnows?: number) {
        for (let playerIndex = 0; playerIndex < this.newPlayerKnownTiles.length; playerIndex++) {
            if (playerIndex !== playerIndexWhoAlreadyKnows) {
                this.newPlayerKnownTiles[playerIndex].push(tile);
            }
        }

        this.newWatcherKnownTiles.push(tile);
    }

    addGameHistoryMessage(gameHistoryMessageData: GameHistoryMessageData) {
        this.gameHistoryMessages.push(gameHistoryMessageData);
    }

    endMove() {
        let clonedGameBoard = new Array(9);
        for (let y = 0; y < 9; y++) {
            clonedGameBoard[y] = [...this.game.gameBoard[y]];
        }
        this.gameBoard = clonedGameBoard;
    }
}

export class GameHistoryMessageData {
    constructor(public gameHistoryMessage: GameHistoryMessage, public playerID: number | null, public parameters: any[]) {}
}
