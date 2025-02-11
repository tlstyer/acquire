import { For } from 'solid-js';
import { toTileString } from '../../../common/helpers.js';
import { type PB_GameBoardType } from '../../../common/pb.js';
import { GameBoard } from '../../components/GameBoard.js';
import { GameBoardLabelMode } from '../../helpers.js';

export function GameBoardExamples() {
  const baseProps = {
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

  const allProps: {
    gameBoard: PB_GameBoardType[][];
    tileRack?: (number | null)[];
    labelMode: GameBoardLabelMode;
    cellSize: number;
    onCellClicked?: (tile: number) => void;
  }[] = [
    baseProps,
    {
      gameBoard: baseProps.gameBoard,
      labelMode: GameBoardLabelMode.Coordinates,
      cellSize: baseProps.cellSize,
    },
    {
      gameBoard: baseProps.gameBoard,
      tileRack: baseProps.tileRack,
      labelMode: GameBoardLabelMode.HotelInitials,
      cellSize: baseProps.cellSize,
    },
  ];

  function onCellClicked(tile: number) {
    console.log('onCellClicked:', toTileString(tile));
  }

  return (
    <For each={allProps}>
      {(props) => (
        <p>
          <GameBoard
            gameBoard={props.gameBoard}
            tileRack={props.tileRack}
            labelMode={props.labelMode}
            cellSize={props.cellSize}
            onCellClicked={props.onCellClicked}
          />
        </p>
      )}
    </For>
  );
}
