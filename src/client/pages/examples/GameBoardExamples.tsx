import { For } from 'solid-js';
import { toTileString } from '../../../common/helpers';
import { PB_GameBoardType } from '../../../common/pb';
import { GameBoard } from '../../components/GameBoard';
import { GameBoardLabelMode } from '../../helpers';

export function GameBoardExamples() {
  const baseGameBoardProps = {
    gameBoard: [
      [0, 0, 7, 1, 1, 7, 2, 2, 7, 3, 3, 7],
      [7, 7, 8, 7, 7, 7, 7, 7, 7, 7, 7, 4],
      [7, 7, 7, 8, 7, 7, 7, 8, 7, 7, 7, 4],
      [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
      [7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5],
      [7, 7, 7, 7, 7, 7, 5, 5, 9, 7, 9, 5],
      [7, 7, 8, 7, 7, 7, 5, 7, 6, 6, 6, 9],
      [7, 7, 7, 7, 7, 8, 7, 7, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6],
    ],
    tileRack: [8, 86, null, 40, 99, 12],
    labelMode: GameBoardLabelMode.Nothing,
    cellSize: 40,
    onCellClicked,
  };

  const allGameBoardProps: {
    gameBoard: PB_GameBoardType[][];
    tileRack?: (number | null)[];
    labelMode: GameBoardLabelMode;
    cellSize: number;
    onCellClicked?: (tile: number) => void;
  }[] = [
    baseGameBoardProps,
    {
      gameBoard: baseGameBoardProps.gameBoard,
      labelMode: GameBoardLabelMode.Coordinates,
      cellSize: baseGameBoardProps.cellSize,
    },
    {
      gameBoard: baseGameBoardProps.gameBoard,
      tileRack: baseGameBoardProps.tileRack,
      labelMode: GameBoardLabelMode.HotelInitials,
      cellSize: baseGameBoardProps.cellSize,
    },
  ];

  function onCellClicked(tile: number) {
    console.log('onCellClicked:', toTileString(tile));
  }

  return (
    <For each={allGameBoardProps}>
      {(gameBoardProps) => (
        <p>
          <GameBoard
            gameBoard={gameBoardProps.gameBoard}
            tileRack={gameBoardProps.tileRack}
            labelMode={gameBoardProps.labelMode}
            cellSize={gameBoardProps.cellSize}
            onCellClicked={gameBoardProps.onCellClicked}
          />
        </p>
      )}
    </For>
  );
}
