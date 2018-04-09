import './global.css';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { GameBoardType } from '../enums';
import { GameBoard } from './components/GameBoard';
import { GameBoardLabelMode } from './enums';

function main() {
    ReactDOM.render([getGameBoard()], document.getElementById('root'));
}

function getGameBoard() {
    const gameBoard = List<GameBoardType>([
        ...[0, 7, 7, 7, 7, 7, 7, 7, 7],
        ...[0, 7, 7, 7, 7, 7, 7, 7, 7],
        ...[7, 8, 7, 7, 7, 7, 8, 7, 7],
        ...[1, 7, 8, 7, 7, 7, 7, 7, 7],
        ...[1, 7, 7, 7, 7, 7, 7, 7, 7],
        ...[7, 7, 7, 7, 5, 7, 7, 8, 7],
        ...[2, 7, 7, 7, 5, 5, 5, 7, 7],
        ...[2, 7, 8, 7, 5, 5, 7, 7, 7],
        ...[7, 7, 7, 7, 5, 9, 6, 6, 6],
        ...[3, 7, 7, 7, 5, 7, 6, 6, 6],
        ...[3, 7, 7, 7, 5, 9, 6, 6, 6],
        ...[7, 4, 4, 7, 5, 5, 9, 6, 6],
    ]);
    const tileRack = List<number | null>([8, 86, null, 40, 99, 12]);
    const gameBoardCellSize = 40;

    return (
        <div>
            <h1>GameBoard</h1>
            <h2>labelMode=Coordinates</h2>
            <div style={{ width: 2 + gameBoardCellSize * 12, height: 2 + gameBoardCellSize * 9, fontSize: gameBoardCellSize * 2 / 5 }}>
                <GameBoard gameBoard={gameBoard} tileRack={tileRack} labelMode={GameBoardLabelMode.Coordinates} />
            </div>
            <h2>labelMode=HotelInitials</h2>
            <div style={{ width: 2 + gameBoardCellSize * 12, height: 2 + gameBoardCellSize * 9, fontSize: gameBoardCellSize * 2 / 5 }}>
                <GameBoard gameBoard={gameBoard} tileRack={tileRack} labelMode={GameBoardLabelMode.HotelInitials} />
            </div>
            <h2>labelMode=Nothing</h2>
            <div style={{ width: 2 + gameBoardCellSize * 12, height: 2 + gameBoardCellSize * 9, fontSize: gameBoardCellSize * 2 / 5 }}>
                <GameBoard gameBoard={gameBoard} tileRack={tileRack} labelMode={GameBoardLabelMode.Nothing} />
            </div>
        </div>
    );
}

main();
