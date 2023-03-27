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
			window.addEventListener('storage', (event) => {
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

	const colorSchemeWritable = newSetting('ColorScheme', (localStorageValue) =>
		localStorageValue === 'white' ? localStorageValue : 'netacquire',
	);
	export const colorScheme = { subscribe: colorSchemeWritable.subscribe };

	const gameBoardLabelModeWritable = newSetting('GameBoardLabelMode', (localStorageValue) => {
		const gblm: GameBoardLabelMode = localStorageValue
			? parseInt(localStorageValue, 10)
			: GameBoardLabelMode.Nothing;
		const gblmStr = GameBoardLabelMode[gblm];
		return gblmStr && gblm.toString() === localStorageValue ? gblm : GameBoardLabelMode.Nothing;
	});
	export const gameBoardLabelMode = { subscribe: gameBoardLabelModeWritable.subscribe };
</script>

<div>
	<label>
		Color Scheme:
		<select bind:value={$colorSchemeWritable}>
			<option value="netacquire">NetAcquire</option>
			<option value="white">White</option>
		</select>
	</label>
</div>
<div>
	<label>
		Game Board Label Mode:
		<select bind:value={$gameBoardLabelModeWritable}>
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
