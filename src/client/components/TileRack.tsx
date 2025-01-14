import { Accessor, createEffect, createMemo, For, JSX, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toTileString } from '../../common/helpers';
import { PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import { gameBoardTypeToCSSClassName } from '../helpers';
import styles from './TileRack.module.css';

export function TileRack(props: {
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

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <For each={allTileData}>
        {(tileData) => (
          <Show
            when={tileData.tile !== null && tileData.type !== null}
            fallback={
              <input type="button" class={stylesApp.invisible} style={buttonStyle()} value="?" />
            }
          >
            <input
              type="button"
              classList={{
                [stylesApp.hotelButton]: true,
                [gameBoardTypeToCSSClassName.get(tileData.type!)!]: true,
              }}
              style={buttonStyle()}
              value={toTileString(tileData.tile!)}
              disabled={
                tileData.type === PB_GameBoardType.CANT_PLAY_EVER ||
                tileData.type === PB_GameBoardType.CANT_PLAY_NOW
              }
              onClick={() => props.onTileClicked(tileData.tile!)}
            />
          </Show>
        )}
      </For>
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
