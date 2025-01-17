import { createSignal, For } from 'solid-js';
import { toTileString } from '../../../common/helpers';
import { PB_GameBoardType } from '../../../common/pb';
import { TileRack } from '../../components/TileRack';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents';
import { EnableKeyboardShortcutsButton } from './EnableKeyboardShortcutsButton';

export function TileRackExamples() {
  const allTileRackProps = [
    {
      tiles: [1, 28, 55, 82, 92, 40],
      types: [
        PB_GameBoardType.LUXOR,
        PB_GameBoardType.TOWER,
        PB_GameBoardType.AMERICAN,
        PB_GameBoardType.FESTIVAL,
        PB_GameBoardType.WORLDWIDE,
        PB_GameBoardType.CONTINENTAL,
      ],
      buttonSize: 40,
      onTileClicked,
    },
    {
      tiles: [71, null, 99, 12, 8, 17],
      types: [
        PB_GameBoardType.IMPERIAL,
        null,
        PB_GameBoardType.WILL_MERGE_CHAINS,
        PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN,
        PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
        PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
      ],
      buttonSize: 40,
      onTileClicked,
    },
    {
      tiles: [null, 86, null, 38, null, 74],
      types: [
        null,
        PB_GameBoardType.CANT_PLAY_EVER,
        null,
        PB_GameBoardType.WILL_FORM_NEW_CHAIN,
        null,
        PB_GameBoardType.CANT_PLAY_NOW,
      ],
      buttonSize: 40,
      onTileClicked,
    },
  ];

  function onTileClicked(tile: number) {
    console.log('onTileClicked:', toTileString(tile));
  }

  return (
    <For each={allTileRackProps}>
      {(tileRackProps) => {
        const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);

        return (
          <>
            <p>
              <EnableKeyboardShortcutsButton onChangeEnabled={setKeyboardShortcutsEnabled} />
            </p>
            <p>
              <TileRack
                ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                tiles={tileRackProps.tiles}
                types={tileRackProps.types}
                buttonSize={tileRackProps.buttonSize}
                onTileClicked={tileRackProps.onTileClicked}
              />
            </p>
          </>
        );
      }}
    </For>
  );
}
