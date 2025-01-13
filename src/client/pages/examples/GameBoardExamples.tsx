import { toTileString } from '../../../common/helpers';
import { GameBoard } from '../../components/GameBoard';
import { GameBoardLabelMode } from '../../helpers';

export function GameBoardExamples() {
  const gameBoard = [
    [0, 0, 7, 1, 1, 7, 2, 2, 7, 3, 3, 7],
    [7, 7, 8, 7, 7, 7, 7, 7, 7, 7, 7, 4],
    [7, 7, 7, 8, 7, 7, 7, 8, 7, 7, 7, 4],
    [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    [7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5],
    [7, 7, 7, 7, 7, 7, 5, 5, 9, 7, 9, 5],
    [7, 7, 8, 7, 7, 7, 5, 7, 6, 6, 6, 9],
    [7, 7, 7, 7, 7, 8, 7, 7, 6, 6, 6, 6],
    [7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6],
  ];
  const tileRack = [8, 86, null, 40, 99, 12];

  function onCellClicked(tile: number) {
    console.log('onCellClicked:', toTileString(tile));
  }

  return (
    <>
      <p>
        <GameBoard
          gameBoard={gameBoard}
          tileRack={tileRack}
          labelMode={GameBoardLabelMode.Nothing}
          cellSize={40}
          onCellClicked={onCellClicked}
        />
      </p>
      <p>
        <GameBoard
          gameBoard={gameBoard}
          tileRack={undefined}
          labelMode={GameBoardLabelMode.Coordinates}
          cellSize={40}
          onCellClicked={undefined}
        />
      </p>
      <p>
        <GameBoard
          gameBoard={gameBoard}
          tileRack={tileRack}
          labelMode={GameBoardLabelMode.HotelInitials}
          cellSize={40}
          onCellClicked={undefined}
        />
      </p>
    </>
  );
}
