<svelte:options immutable />

<script lang="ts" context="module">
  import { browser } from '$app/environment';
  import { writable } from 'svelte/store';
  import { GameBoardLabelMode } from './helpers';

  function newSetting<T extends { toString(): string }>(
    localStorageKey: string,
    localStorageValueToValidValue: (localStorageValue: string | null) => T,
  ) {
    const store = writable(
      localStorageValueToValidValue(browser ? localStorage.getItem(localStorageKey) : null),
    );

    if (browser) {
      addEventListener('storage', (event) => {
        if (event.key === localStorageKey || event.key === null) {
          store.set(localStorageValueToValidValue(event.newValue));
        }
      });
    }

    return {
      subscribe: store.subscribe,
      set(newValue: T) {
        if (browser) {
          localStorage.setItem(localStorageKey, newValue.toString());
        }
        store.set(newValue);
      },
    };
  }

  const colorSchemeWritableStore = newSetting('ColorScheme', (localStorageValue) =>
    localStorageValue === 'white' ? localStorageValue : 'netacquire',
  );
  export const colorSchemeStore = { subscribe: colorSchemeWritableStore.subscribe };

  const gameBoardLabelModeWritableStore = newSetting('GameBoardLabelMode', (localStorageValue) => {
    const gblm: GameBoardLabelMode = localStorageValue
      ? parseInt(localStorageValue, 10)
      : GameBoardLabelMode.Nothing;
    const gblmStr = GameBoardLabelMode[gblm];
    return gblmStr && gblm.toString() === localStorageValue ? gblm : GameBoardLabelMode.Nothing;
  });
  export const gameBoardLabelModeStore = { subscribe: gameBoardLabelModeWritableStore.subscribe };
</script>

<div>
  <label>
    Color Scheme:
    <select bind:value={$colorSchemeWritableStore}>
      <option value="netacquire">NetAcquire</option>
      <option value="white">White</option>
    </select>
  </label>
</div>
<div>
  <label>
    Game Board Label Mode:
    <select bind:value={$gameBoardLabelModeWritableStore}>
      <option value={GameBoardLabelMode.Nothing}>Nothing</option>
      <option value={GameBoardLabelMode.Coordinates}>Coordinates</option>
      <option value={GameBoardLabelMode.HotelInitials}>Hotel Initials</option>
    </select>
  </label>
</div>

<style>
  div {
    margin-top: 8px;
  }
</style>
