<script lang="ts">
  import { getTileString } from '$lib/helpers';
  import TileRack from '$lib/TileRack.svelte';
  import { PB_GameBoardType } from '../../common/pb';

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
      types: [null, PB_GameBoardType.CANT_PLAY_EVER, null, PB_GameBoardType.WILL_FORM_NEW_CHAIN, null, PB_GameBoardType.CANT_PLAY_NOW],
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onTileClicked,
    },
  ];

  function onTileClicked(tile: number) {
    console.log('onTileClicked:', getTileString(tile));
  }
</script>

{#each allTileRackProps as tileRackProps}
  <label>
    <input type="checkbox" bind:checked={tileRackProps.keyboardShortcutsEnabled} />
    Enable Keyboard Shortcuts
  </label>
  <TileRack
    tiles={tileRackProps.tiles}
    types={tileRackProps.types}
    buttonSize={tileRackProps.buttonSize}
    keyboardShortcutsEnabled={tileRackProps.keyboardShortcutsEnabled}
    onTileClicked={tileRackProps.onTileClicked}
  />
  <br />
{/each}
