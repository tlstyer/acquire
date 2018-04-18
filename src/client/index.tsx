import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultTileRack, defaultTileRackTypes } from '../common/defaults';
import { Game, MoveData } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { runGameTestFile } from '../common/runGameTestFile';
import { GameBoard } from './components/GameBoard';
import { GameHistory } from './components/GameHistory';
import { ScoreBoard } from './components/ScoreBoard';
import { TileRack } from './components/TileRack';
import { GameBoardLabelMode } from './enums';

const dummyMoveData = new MoveData(new Game([], [], 0, null));

function render(moveIndex: number) {
    const usernames = ['squidward'];
    const moveData = game.moveDataHistory.get(moveIndex, dummyMoveData);
    const tileRack = moveData.tileRacks.get(0, defaultTileRack);
    const tileRackTypes = moveData.tileRackTypes.get(0, defaultTileRackTypes);

    let turnPlayerID = moveData.turnPlayerID;
    let movePlayerID = moveData.nextGameAction.playerID;
    if (moveData.nextGameAction instanceof ActionGameOver) {
        turnPlayerID = -1;
        movePlayerID = -1;
    }

    ReactDOM.render(
        <div>
            <GameBoard
                gameBoard={moveData.gameBoard}
                tileRack={tileRack}
                labelMode={GameBoardLabelMode.Nothing}
                cellSize={40}
                onCellClicked={onTileClicked}
            />
            <ScoreBoard
                usernames={usernames}
                scoreBoard={moveData.scoreBoard}
                scoreBoardAvailable={moveData.scoreBoardAvailable}
                scoreBoardChainSize={moveData.scoreBoardChainSize}
                scoreBoardPrice={moveData.scoreBoardPrice}
                turnPlayerID={turnPlayerID}
                movePlayerID={movePlayerID}
                isTeamGame={false}
                cellWidth={30}
            />
            <TileRack tiles={tileRack} types={tileRackTypes} buttonSize={40} onTileClicked={onTileClicked} />
            <GameHistory usernames={usernames} moveDataHistory={game.moveDataHistory} selectedMove={moveIndex} onMoveClicked={onMoveClicked} />
        </div>,
        document.getElementById('root'),
    );
}

function onTileClicked(tile: number) { }

function onMoveClicked(index: number) {
    render(index);
}

let game: Game;

function main() {
    const { game: g } = runGameTestFile(require('raw-loader!../common/gameTestFiles/other/one player game high score').split('\n'));
    if (g === null) {
        ReactDOM.render(<div>Couldn't load game.</div>, document.getElementById('root'));

        return;
    }

    game = g;
    render(game.moveDataHistory.size - 1);
}

main();
