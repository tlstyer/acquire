import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { MoveData } from '../game';
import { runGameTestFile } from '../runGameTestFile';
import { GameBoard } from './components/GameBoard';

const inputLines: string[] = require('raw-loader!../gameTestFiles/other/all tiles played').split('\n');

async function showMoveSequence(moveData: MoveData[]) {
    for (let i = 0; i < moveData.length; i++) {
        const entry = moveData[i];
        const gameBoard = entry.gameBoard;

        ReactDOM.render(
            <div>
                <GameBoard gameBoard={gameBoard} />
            </div>,
            document.getElementById('root'),
        );

        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

const game = runGameTestFile(inputLines).game;
if (game !== null) {
    showMoveSequence(game.moveDataHistory);
}
