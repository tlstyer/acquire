import './global.css';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultTileRack, defaultTileRackTypes } from '../common/defaults';
import { GameMode, PlayerArrangementMode } from '../common/enums';
import { Game, MoveData } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { runGameTestFile } from '../common/runGameTestFile';
import { GameBoard } from './components/GameBoard';
import { GameHistory } from './components/GameHistory';
import { GameState } from './components/GameState';
import { ScoreBoard } from './components/ScoreBoard';
import { TileRackReadOnly } from './components/TileRackReadOnly';
import { GameBoardLabelMode } from './enums';

const dummyMoveData = new MoveData(new Game(GameMode.Singles1, PlayerArrangementMode.RandomOrder, [], List(), List(), 0, null));

function render(moveIndex: number) {
    const moveData = game.moveDataHistory.get(moveIndex, dummyMoveData);

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
    const scoreBoardCellHeight = Math.ceil(scoreBoardCellWidth * 0.8);
    const scoreBoardHeight = scoreBoardCellHeight * (4 + game.usernames.size) + 2;

    const tileRackLeft = scoreBoardLeft + 2;
    const tileRackTop = scoreBoardTop + scoreBoardHeight + 2;
    const tileRackHeight = gameBoardCellSize + (game.userIDs.size - 1) * (gameBoardCellSize + 4);

    const gameStateHeight = 22;
    const gameStateTop = windowHeight - gameStateHeight;

    const gameHistoryTop = tileRackTop + tileRackHeight + 4;
    const gameHistoryWidth = windowWidth - tileRackLeft;
    const gameHistoryHeight = windowHeight - gameHistoryTop - gameStateHeight - 2;

    ReactDOM.render(
        <>
            <div style={{ position: 'absolute', left: gameBoardLeft, top: gameBoardTop }}>
                <GameBoard gameBoard={moveData.gameBoard} labelMode={GameBoardLabelMode.Nothing} cellSize={gameBoardCellSize} />
            </div>
            <div style={{ position: 'absolute', left: scoreBoardLeft, top: scoreBoardTop }}>
                <ScoreBoard
                    usernames={game.usernames}
                    scoreBoard={moveData.scoreBoard}
                    scoreBoardAvailable={moveData.scoreBoardAvailable}
                    scoreBoardChainSize={moveData.scoreBoardChainSize}
                    scoreBoardPrice={moveData.scoreBoardPrice}
                    safeChains={moveData.safeChains}
                    turnPlayerID={turnPlayerID}
                    movePlayerID={movePlayerID}
                    gameMode={game.gameMode}
                    cellWidth={scoreBoardCellWidth}
                />
            </div>
            {game.userIDs.map((_, i) => {
                const tileRack = moveData.tileRacks.get(i, defaultTileRack);
                const tileRackTypes = moveData.tileRackTypes.get(i, defaultTileRackTypes);
                return (
                    <div key={i} style={{ position: 'absolute', left: tileRackLeft, top: tileRackTop + i * (gameBoardCellSize + 4) }}>
                        <TileRackReadOnly tiles={tileRack} types={tileRackTypes} buttonSize={gameBoardCellSize} />
                    </div>
                );
            })}
            <div style={{ position: 'absolute', left: tileRackLeft, top: gameHistoryTop }}>
                <GameHistory
                    usernames={game.usernames}
                    moveDataHistory={game.moveDataHistory}
                    selectedMove={moveIndex}
                    width={gameHistoryWidth}
                    height={gameHistoryHeight}
                    onMoveClicked={onMoveClicked}
                />
            </div>
            <div style={{ position: 'absolute', left: tileRackLeft, top: gameStateTop }}>
                <GameState usernames={game.usernames} nextGameAction={moveData.nextGameAction} width={gameHistoryWidth} height={gameStateHeight} />
            </div>
        </>,
        document.getElementById('root'),
    );
}

function onTileClicked(tile: number) {}

function onMoveClicked(index: number) {
    if (index !== selectedMove) {
        selectedMove = index;
        render(selectedMove);
    }
}

window.addEventListener('keydown', event => {
    const keyName = event.key;

    if (keyName === 'ArrowLeft' || keyName === 'ArrowRight') {
        const previouslySelectedMove = selectedMove;

        if (keyName === 'ArrowLeft') {
            selectedMove--;
            if (selectedMove < 0) {
                selectedMove = 0;
            }
        } else {
            selectedMove++;
            const lastMove = game.moveDataHistory.size - 1;
            if (selectedMove > lastMove) {
                selectedMove = lastMove;
            }
        }

        if (selectedMove !== previouslySelectedMove) {
            render(selectedMove);
        }
    }
});

let lastPeriodicResizeCheckWidth = -1;
let lastPeriodicResizeCheckHeight = -1;
function periodicResizeCheck() {
    if (window.innerWidth !== lastPeriodicResizeCheckWidth || window.innerHeight !== lastPeriodicResizeCheckHeight) {
        lastPeriodicResizeCheckWidth = window.innerWidth;
        lastPeriodicResizeCheckHeight = window.innerHeight;
        render(selectedMove);
    }

    setTimeout(periodicResizeCheck, 500);
}

let game: Game;
let selectedMove: number;

function main() {
    const { game: g } = runGameTestFile(require('raw-loader!../common/gameTestFiles/other/no tiles played for entire round').split('\n'));
    if (g === null) {
        ReactDOM.render(<div>Couldn't load game.</div>, document.getElementById('root'));

        return;
    }

    game = g;
    selectedMove = game.moveDataHistory.size - 1;
    periodicResizeCheck();
}

main();
