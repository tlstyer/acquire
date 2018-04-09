import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultTileRack } from '../defaults';
import { MoveData } from '../game';
import { runGameTestFile } from '../runGameTestFile';
import { GameBoard } from './components/GameBoard';

const inputLines: string[] = require('raw-loader!../gameTestFiles/other/no tiles played for entire round').split('\n');

async function showMoveSequence(moveData: MoveData[]) {
    for (let i = 0; i < moveData.length; i++) {
        const entry = moveData[i];

        ReactDOM.render(
            <div style={{ width: 2 + 50 * 12, height: 2 + 50 * 9, fontSize: 50 * 2 / 5 }}>
                <GameBoard gameBoard={entry.gameBoard} tileRack={entry.tileRacks.get(0, defaultTileRack)} />
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
