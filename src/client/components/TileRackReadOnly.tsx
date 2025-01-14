import { createMemo, For, JSX } from 'solid-js';
import { toTileString } from '../../common/helpers';
import { PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import { gameBoardTypeToCSSClassName } from '../helpers';
import { allTileDataFromTilesAndTypes } from './TileRack';
import styles from './TileRackReadOnly.module.css';

export function TileRackReadOnly(props: {
  tiles: (number | null)[];
  types: (PB_GameBoardType | null)[];
  buttonSize: number;
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
          <div
            classList={{
              [styles.button]: true,
              [tileData.type !== null ? gameBoardTypeToCSSClassName.get(tileData.type)! : '']:
                tileData.type !== null,
              [stylesApp.invisible]: tileData.type === null,
            }}
            style={buttonStyle()}
          >
            <div>{tileData.tile !== null ? toTileString(tileData.tile) : '?'}</div>
          </div>
        )}
      </For>
    </div>
  );
}
