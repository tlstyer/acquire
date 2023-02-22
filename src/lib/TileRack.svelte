<svelte:options immutable />

<script lang="ts" context="module">
	type TileData = {
		tile: number;
		type: PB_GameBoardType;
		element?: HTMLInputElement;
	};

	const keyboardShortcutToTileIndex = new Map([
		['1', 0],
		['2', 1],
		['3', 2],
		['4', 3],
		['5', 4],
		['6', 5],
	]);
</script>

<script lang="ts">
	import { PB_GameBoardType } from '$common/pb';
	import { gameBoardTypeToCSSClassName, getTileString } from './helpers';

	export let tiles: (number | null)[];
	export let types: (PB_GameBoardType | null)[];
	export let buttonSize: number;
	export let keyboardShortcutsEnabled: boolean;
	export let onTileClicked: (tile: number) => void;

	let allTileData: (TileData | undefined)[] = new Array(6);
	allTileData.fill(undefined);

	$: for (let i = 0; i < tiles.length; i++) {
		const tile = tiles[i];
		const type = types[i];

		if (tile !== null && type !== null) {
			if (allTileData[i]) {
				allTileData[i]!.tile = tile;
				allTileData[i]!.type = type;
			} else {
				allTileData[i] = { tile, type };
			}
		} else {
			allTileData[i] = undefined;
		}
	}

	$: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px;`;

	function handleKeydown(event: KeyboardEvent) {
		if (keyboardShortcutsEnabled) {
			const tileIndex = keyboardShortcutToTileIndex.get(event.key);

			if (tileIndex !== undefined) {
				allTileData[tileIndex]?.element?.focus();
			}
		}
	}

	function onClick(tileData: TileData | undefined) {
		if (tileData) {
			onTileClicked(tileData.tile);
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="root" style="font-size: {Math.floor(buttonSize * 0.4)}px">
	{#each allTileData as tileData}
		{#if tileData}
			<input
				type="button"
				class={`hotelButton ${gameBoardTypeToCSSClassName.get(tileData.type)}`}
				style={buttonStyle}
				value={getTileString(tileData.tile)}
				disabled={tileData.type === PB_GameBoardType.CANT_PLAY_EVER ||
					tileData.type === PB_GameBoardType.CANT_PLAY_NOW}
				on:click={() => onClick(tileData)}
				bind:this={tileData.element}
			/>
		{:else}
			<input type="button" class="invisible" style={buttonStyle} value="?" />
		{/if}
	{/each}
</div>

<style>
	.root :not(:last-child) {
		margin-right: 4px;
	}
</style>
