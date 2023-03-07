<svelte:options immutable />

<script lang="ts" context="module">
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';

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
</script>

<script lang="ts">
	export const show = () => dialog?.showModal();

	let dialog: HTMLDialogElement | null = null;

	function onClick(event: MouseEvent) {
		if (dialog) {
			const rect = dialog.getBoundingClientRect();
			const isInDialog =
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width;
			if (!isInDialog) {
				dialog.close();
			}
		}
	}
</script>

<dialog bind:this={dialog} on:click={onClick} on:keydown={undefined}>
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
	<button on:click={() => dialog?.close()}>Close</button>
</dialog>
