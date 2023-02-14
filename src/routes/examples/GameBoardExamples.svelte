<script lang="ts">
  import GameBoard from '$lib/GameBoard.svelte';
  import { GameBoardLabelMode, getTileString } from '$lib/helpers';
  import type { PB_GameBoardType } from '../../common/pb';

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
    labelMode: GameBoardLabelMode.Coordinates,
    cellSize: 40,
    onCellClicked: onTileClicked,
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
      labelMode: GameBoardLabelMode.HotelInitials,
      cellSize: baseGameBoardProps.cellSize,
    },
    {
      gameBoard: baseGameBoardProps.gameBoard,
      tileRack: baseGameBoardProps.tileRack,
      labelMode: GameBoardLabelMode.Nothing,
      cellSize: baseGameBoardProps.cellSize,
    },
  ];

  function onTileClicked(tile: number) {
    console.log('onTileClicked:', getTileString(tile));
  }
</script>

{#each allGameBoardProps as gameBoardProps}
  <GameBoard
    gameBoard={gameBoardProps.gameBoard}
    tileRack={gameBoardProps.tileRack}
    labelMode={gameBoardProps.labelMode}
    cellSize={gameBoardProps.cellSize}
    onCellClicked={gameBoardProps.onCellClicked}
  />
  <br />
{/each}
