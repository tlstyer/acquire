<script lang="ts">
  import TileRack from '$lib/TileRack.svelte';
  import { toTileString } from '../../common/helpers';
  import { PB_GameBoardType } from '../../common/pb';
  import EnableKeyboardShortcutsButton from './EnableKeyboardShortcutsButton.svelte';

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
      keyboardShortcutsEnabled: false,
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
      keyboardShortcutsEnabled: false,
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
      keyboardShortcutsEnabled: false,
      onTileClicked,
    },
  ];

  function onTileClicked(tile: number) {
    console.log('onTileClicked:', toTileString(tile));
  }
</script>

{#each allTileRackProps as tileRackProps}
  <p>
    <EnableKeyboardShortcutsButton bind:enabled={tileRackProps.keyboardShortcutsEnabled} />
  </p>
  <p>
    <TileRack
      tiles={tileRackProps.tiles}
      types={tileRackProps.types}
      buttonSize={tileRackProps.buttonSize}
      keyboardShortcutsEnabled={tileRackProps.keyboardShortcutsEnabled}
      onTileClicked={tileRackProps.onTileClicked}
    />
  </p>
{/each}
