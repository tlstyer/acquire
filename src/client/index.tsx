import './global.css';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { GameBoardType } from '../enums';
import { GameBoard } from './components/GameBoard';
import { GameBoardLabelMode } from './enums';
import { TileRack } from './components/TileRack';
import { getTileString } from './helpers';

function main() {
    ReactDOM.render([getGameBoard(), getTileRack()], document.getElementById('root'));
}

function onTileClicked(tile: number) {
    console.log('onTileClicked:', getTileString(tile));
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
    const cellSize = 40;

    return (
        <div>
            <h1>GameBoard</h1>
            <h2>labelMode=Coordinates</h2>
            <GameBoard gameBoard={gameBoard} tileRack={tileRack} labelMode={GameBoardLabelMode.Coordinates} cellSize={cellSize} onCellClicked={onTileClicked} />
            <h2>labelMode=HotelInitials</h2>
            <GameBoard
                gameBoard={gameBoard}
                tileRack={tileRack}
                labelMode={GameBoardLabelMode.HotelInitials}
                cellSize={cellSize}
                onCellClicked={onTileClicked}
            />
            <h2>labelMode=Nothing</h2>
            <GameBoard gameBoard={gameBoard} tileRack={tileRack} labelMode={GameBoardLabelMode.Nothing} cellSize={cellSize} onCellClicked={onTileClicked} />
        </div>
    );
}

function getTileRack() {
    const tiles1 = List<number | null>([1, 28, 55, 82, 92, 40]);
    const types1 = List<GameBoardType | null>([
        GameBoardType.Luxor,
        GameBoardType.Tower,
        GameBoardType.American,
        GameBoardType.Festival,
        GameBoardType.Worldwide,
        GameBoardType.Continental,
    ]);

    const tiles2 = List<number | null>([71, null, 99, 12, 8, 17]);
    const types2 = List<GameBoardType | null>([
        GameBoardType.Imperial,
        null,
        GameBoardType.WillMergeChains,
        GameBoardType.WillPutLonelyTileDown,
        GameBoardType.HaveNeighboringTileToo,
        GameBoardType.HaveNeighboringTileToo,
    ]);

    const tiles3 = List<number | null>([null, 86, null, 38, null, 74]);
    const types3 = List<GameBoardType | null>([null, GameBoardType.CantPlayEver, null, GameBoardType.WillFormNewChain, null, GameBoardType.CantPlayNow]);

    const buttonSize = 40;

    return (
        <div>
            <h1>TileRack</h1>
            <TileRack tiles={tiles1} types={types1} buttonSize={buttonSize} onTileClicked={onTileClicked} />
            <br />
            <TileRack tiles={tiles2} types={types2} buttonSize={buttonSize} onTileClicked={onTileClicked} />
            <br />
            <TileRack tiles={tiles3} types={types3} buttonSize={buttonSize} onTileClicked={onTileClicked} />
        </div>
    );
}

main();
