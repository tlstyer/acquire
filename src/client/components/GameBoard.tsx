import { createMemo, Index } from 'solid-js';
import { toTileString } from '../../common/helpers';
import { PB_GameBoardType } from '../../common/pb';
import {
  GameBoardLabelMode,
  gameBoardTypeToCSSClassName,
  gameBoardTypeToHotelInitial,
} from '../helpers';
import styles from './GameBoard.module.css';

export function GameBoard(props: {
  gameBoard: PB_GameBoardType[][];
  tileRack: (number | null)[] | undefined;
  labelMode: GameBoardLabelMode;
  cellSize: number;
  onCellClicked: ((tile: number) => void) | undefined;
}) {
  const tileRackRowBitMasks = createMemo(() => {
    const tileRackRowBitMasks = new Array(9);
    tileRackRowBitMasks.fill(0);

    const tr = props.tileRack;

    if (tr) {
      for (let i = 0; i < tr.length; i++) {
        const tile = tr[i];

        if (tile !== null) {
          const y = tile % 9;
          const x = (tile - y) / 9;
          tileRackRowBitMasks[y] |= 1 << x;
        }
      }
    }

    return tileRackRowBitMasks;
  });

  return (
    <table
      class={styles.root}
      style={{
        width: `${props.cellSize * 12 + 2}px`,
        height: `${props.cellSize * 9 + 2}px`,
        'font-size': `${Math.floor(props.cellSize * 0.4)}px`,
      }}
    >
      <tbody>
        <Index each={props.gameBoard}>
          {(gameBoardRow, y) => (
            <GameBoardRow
              y={y}
              gameBoardRow={gameBoardRow()}
              tileRackRowBitMask={tileRackRowBitMasks()[y]}
              labelMode={props.labelMode}
              onCellClicked={props.onCellClicked}
            />
          )}
        </Index>
      </tbody>
    </table>
  );
}

function GameBoardRow(props: {
  y: number;
  gameBoardRow: PB_GameBoardType[];
  tileRackRowBitMask: number;
  labelMode: GameBoardLabelMode;
  onCellClicked: ((tile: number) => void) | undefined;
}) {
  return (
    <tr>
      <Index each={props.gameBoardRow}>
        {(gameBoardType, x) => (
          <GameBoardCell
            tile={x * 9 + props.y}
            gameBoardType={
              ((props.tileRackRowBitMask >> x) & 1) === 1
                ? PB_GameBoardType.I_HAVE_THIS
                : gameBoardType()
            }
            labelMode={props.labelMode}
            onCellClicked={props.onCellClicked}
          />
        )}
      </Index>
    </tr>
  );
}

function GameBoardCell(props: {
  tile: number;
  gameBoardType: PB_GameBoardType;
  labelMode: GameBoardLabelMode;
  onCellClicked: ((tile: number) => void) | undefined;
}) {
  const label = createMemo(() => {
    if (props.labelMode === GameBoardLabelMode.Nothing) {
      if (
        props.gameBoardType === PB_GameBoardType.NOTHING ||
        props.gameBoardType === PB_GameBoardType.I_HAVE_THIS
      ) {
        return toTileString(props.tile);
      } else {
        return '\u00a0';
      }
    } else if (props.labelMode === GameBoardLabelMode.Coordinates) {
      return toTileString(props.tile);
    } else if (props.labelMode === GameBoardLabelMode.HotelInitials) {
      if (
        props.gameBoardType === PB_GameBoardType.NOTHING ||
        props.gameBoardType === PB_GameBoardType.I_HAVE_THIS
      ) {
        return toTileString(props.tile);
      } else if (props.gameBoardType <= PB_GameBoardType.IMPERIAL) {
        return gameBoardTypeToHotelInitial.get(props.gameBoardType)!;
      } else {
        return '\u00a0';
      }
    }
  });

  const clickable = createMemo(
    () => props.gameBoardType === PB_GameBoardType.I_HAVE_THIS && props.onCellClicked !== undefined,
  );

  function onClick() {
    if (clickable()) {
      props.onCellClicked?.(props.tile);
    }
  }

  return (
    <td
      classList={{
        [gameBoardTypeToCSSClassName.get(props.gameBoardType)!]: true,
        [styles.clickable]: clickable(),
      }}
      onClick={onClick}
      onKeyDown={undefined}
    >
      {label()}
    </td>
  );
}
