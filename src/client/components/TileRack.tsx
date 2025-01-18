import { Accessor, createEffect, createMemo, Index, JSX, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toTileString } from '../../common/helpers';
import { PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import { gameBoardTypeToCSSClassName } from '../helpers';
import { ProcessMyKeyboardEventRef } from '../myKeyboardEvents';
import styles from './TileRack.module.css';

export function TileRack(props: {
  ref: (ref: ProcessMyKeyboardEventRef) => void;
  tiles: (number | null)[];
  types: (PB_GameBoardType | null)[];
  buttonSize: number;
  onTileClicked: (tile: number) => void;
}) {
  const allTileData = allTileDataFromTilesAndTypes(
    // eslint-disable-next-line solid/reactivity
    () => props.tiles,
    // eslint-disable-next-line solid/reactivity
    () => props.types,
  );

  const buttonStyle = createMemo<JSX.CSSProperties>(() => ({
    width: `${props.buttonSize}px`,
    height: `${props.buttonSize}px`,
  }));

  const inputs: HTMLInputElement[] = new Array(6);
  onMount(() => {
    props.ref({
      processMyKeyboardEvent: (myKeyboardEvent) => {
        const tileIndex = keyboardEventCodeToTileIndex.get(myKeyboardEvent.code);

        if (tileIndex !== undefined && myKeyboardEvent.modifiers === 0) {
          inputs[tileIndex].focus();
        }
      },
    });
  });

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <Index each={allTileData}>
        {(tileData, index) => (
          <Show
            when={tileData().tile !== null && tileData().type !== null}
            fallback={
              <input type="button" class={stylesApp.invisible} style={buttonStyle()} value="?" />
            }
          >
            <input
              ref={inputs[index]}
              type="button"
              classList={{
                [stylesApp.hotelButton]: true,
                [gameBoardTypeToCSSClassName.get(tileData().type!)!]: true,
              }}
              style={buttonStyle()}
              value={toTileString(tileData().tile!)}
              disabled={
                tileData().type === PB_GameBoardType.CANT_PLAY_EVER ||
                tileData().type === PB_GameBoardType.CANT_PLAY_NOW
              }
              onClick={() => props.onTileClicked(tileData().tile!)}
            />
          </Show>
        )}
      </Index>
    </div>
  );
}

export function allTileDataFromTilesAndTypes(
  tiles: Accessor<(number | null)[]>,
  types: Accessor<(PB_GameBoardType | null)[]>,
) {
  const [allTileData, setAllTileData] = createStore<
    { tile: number | null; type: PB_GameBoardType | null }[]
  >([
    { tile: null, type: null },
    { tile: null, type: null },
    { tile: null, type: null },
    { tile: null, type: null },
    { tile: null, type: null },
    { tile: null, type: null },
  ]);

  createEffect(() => {
    const t = tiles();
    for (let i = 0; i < t.length; i++) {
      setAllTileData(i, 'tile', t[i]);
    }
  });

  createEffect(() => {
    const t = types();
    for (let i = 0; i < t.length; i++) {
      setAllTileData(i, 'type', t[i]);
    }
  });

  return allTileData;
}

export const keyboardEventCodeToTileIndex = new Map([
  ['Digit1', 0],
  ['Numpad1', 0],
  ['Digit2', 1],
  ['Numpad2', 1],
  ['Digit3', 2],
  ['Numpad3', 2],
  ['Digit4', 3],
  ['Numpad4', 3],
  ['Digit5', 4],
  ['Numpad5', 4],
  ['Digit6', 5],
  ['Numpad6', 5],
]);
