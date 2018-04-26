import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultTileRack, defaultTileRackTypes } from '../common/defaults';
import { GameMode } from '../common/enums';
import { Game, MoveData } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { runGameTestFile } from '../common/runGameTestFile';
import { GameBoard } from './components/GameBoard';
import { GameHistory } from './components/GameHistory';
import { GameState } from './components/GameState';
import { ScoreBoard } from './components/ScoreBoard';
import { TileRack } from './components/TileRack';
import { GameBoardLabelMode } from './enums';

const dummyMoveData = new MoveData(new Game([], [], 0, null));

function render(moveIndex: number) {
    const moveData = game.moveDataHistory.get(moveIndex, dummyMoveData);
    const tileRack = moveData.tileRacks.get(0, defaultTileRack);
    const tileRackTypes = moveData.tileRackTypes.get(0, defaultTileRackTypes);

    let turnPlayerID = moveData.turnPlayerID;
    let movePlayerID = moveData.nextGameAction.playerID;
    if (moveData.nextGameAction instanceof ActionGameOver) {
        turnPlayerID = -1;
        movePlayerID = -1;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const gameBoardLeft = -2;
    const gameBoardTop = -2;
    const gameBoardCellSizeBasedOnWindowWidth = windowWidth / 2 / 12;
    const gameBoardCellSizeBasedOnWindowHeight = (windowHeight - 129) / 9;
    const gameBoardCellSize = Math.floor(Math.min(gameBoardCellSizeBasedOnWindowWidth, gameBoardCellSizeBasedOnWindowHeight));
    const gameBoardWidth = gameBoardCellSize * 12 + 2;

    const scoreBoardLeft = gameBoardLeft + gameBoardWidth;
    const scoreBoardTop = -2;
    const scoreBoardCellWidth = Math.floor(gameBoardWidth / 18);
    const scoreBoardCellHeight = Math.ceil(scoreBoardCellWidth * 0.75);
    const scoreBoardHeight = scoreBoardCellHeight * (4 + usernames.length) + 2;

    const tileRackLeft = scoreBoardLeft + 2;
    const tileRackTop = scoreBoardTop + scoreBoardHeight + 2;

    const gameStateHeight = 22;
    const gameStateTop = windowHeight - gameStateHeight;

    const gameHistoryTop = tileRackTop + gameBoardCellSize + 4;
    const gameHistoryWidth = windowWidth - tileRackLeft;
    const gameHistoryHeight = windowHeight - gameHistoryTop - gameStateHeight - 2;

    ReactDOM.render(
        <div>
            <div style={{ position: 'absolute', left: gameBoardLeft, top: gameBoardTop }}>
                <GameBoard
                    gameBoard={moveData.gameBoard}
                    tileRack={tileRack}
                    labelMode={GameBoardLabelMode.Nothing}
                    cellSize={gameBoardCellSize}
                    onCellClicked={onTileClicked}
                />
            </div>
            <div style={{ position: 'absolute', left: scoreBoardLeft, top: scoreBoardTop }}>
                <ScoreBoard
                    usernames={usernames}
                    scoreBoard={moveData.scoreBoard}
                    scoreBoardAvailable={moveData.scoreBoardAvailable}
                    scoreBoardChainSize={moveData.scoreBoardChainSize}
                    scoreBoardPrice={moveData.scoreBoardPrice}
                    turnPlayerID={turnPlayerID}
                    movePlayerID={movePlayerID}
                    gameMode={GameMode.Singles1}
                    cellWidth={scoreBoardCellWidth}
                />
            </div>
            <div style={{ position: 'absolute', left: tileRackLeft, top: tileRackTop }}>
                <TileRack tiles={tileRack} types={tileRackTypes} buttonSize={gameBoardCellSize} onTileClicked={onTileClicked} />
            </div>
            <div style={{ position: 'absolute', left: tileRackLeft, top: gameHistoryTop }}>
                <GameHistory
                    usernames={usernames}
                    moveDataHistory={game.moveDataHistory}
                    selectedMove={moveIndex}
                    width={gameHistoryWidth}
                    height={gameHistoryHeight}
                    onMoveClicked={onMoveClicked}
                />
            </div>
            <div style={{ position: 'absolute', left: tileRackLeft, top: gameStateTop }}>
                <GameState
                    usernames={usernames}
                    nextGameAction={game.moveDataHistory.get(game.moveDataHistory.size - 1, dummyMoveData).nextGameAction}
                    width={gameHistoryWidth}
                    height={gameStateHeight}
                />
            </div>
        </div>,
        document.getElementById('root'),
    );
}

function onTileClicked(tile: number) {}

function onMoveClicked(index: number) {
    render(index);
}

let game: Game;
let usernames: string[];

function main() {
    const { game: g } = runGameTestFile(require('raw-loader!../common/gameTestFiles/other/one player game high score').split('\n'));
    if (g === null) {
        ReactDOM.render(<div>Couldn't load game.</div>, document.getElementById('root'));

        return;
    }

    game = g;
    usernames = ['squidward'];
    render(game.moveDataHistory.size - 1);
}

main();
