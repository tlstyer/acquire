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
				if (event.key === localStorageKey) {
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

	const colorSchemeSetting = newSetting('ColorScheme', (localStorageValue) =>
		localStorageValue === 'White' ? localStorageValue : 'NetAcquire',
	);
	export const colorScheme = { subscribe: colorSchemeSetting.subscribe };

	const gameBoardLabelModeSetting = newSetting('GameBoardLabelMode', (localStorageValue) => {
		const gblm: GameBoardLabelMode = localStorageValue
			? parseInt(localStorageValue, 10)
			: GameBoardLabelMode.Nothing;
		const gblmStr = GameBoardLabelMode[gblm];
		return gblmStr && gblm.toString() === localStorageValue ? gblm : GameBoardLabelMode.Nothing;
	});
	export const gameBoardLabelMode = { subscribe: gameBoardLabelModeSetting.subscribe };
</script>

<script lang="ts">
	export const show = () => dialog?.showModal();

	let dialog: HTMLDialogElement | null = null;
</script>

<dialog bind:this={dialog}>
	<h3>Settings</h3>
	<p>
		<label>
			Color Scheme:
			<select bind:value={$colorSchemeSetting}>
				<option value="NetAcquire">NetAcquire</option>
				<option value="White">White</option>
			</select>
		</label>
	</p>
	<p>
		<label>
			Game Board Label Mode:
			<select bind:value={$gameBoardLabelModeSetting}>
				<option value={GameBoardLabelMode.Nothing}>Nothing</option>
				<option value={GameBoardLabelMode.Coordinates}>Coordinates</option>
				<option value={GameBoardLabelMode.HotelInitials}>Hotel Initials</option>
			</select>
		</label>
	</p>
	<button on:click={() => dialog?.close()}>Close</button>
</dialog>
