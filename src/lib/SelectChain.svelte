<svelte:options immutable />

<script lang="ts" context="module">
	export enum SelectChainTitle {
		SelectNewChain,
		SelectMergerSurvivor,
		SelectChainToDisposeOfNext,
	}

	const typeToInstructions = new Map([
		[SelectChainTitle.SelectNewChain, 'New chain'],
		[SelectChainTitle.SelectMergerSurvivor, 'Merger survivor'],
		[SelectChainTitle.SelectChainToDisposeOfNext, 'Chain to dispose of next'],
	]);

	const keyboardShortcutToChain = new Map([
		['1', 0],
		['l', 0],
		['2', 1],
		['t', 1],
		['3', 2],
		['a', 2],
		['4', 3],
		['f', 3],
		['5', 4],
		['w', 4],
		['6', 5],
		['c', 5],
		['7', 6],
		['i', 6],
	]);
</script>

<script lang="ts">
	import type { PB_GameBoardType } from '$common/pb';
	import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from './helpers';

	export let type: SelectChainTitle;
	export let availableChains: PB_GameBoardType[];
	export let buttonSize: number;
	export let keyboardShortcutsEnabled: boolean;
	export let onChainSelected: (chain: PB_GameBoardType) => void;

	const inputs: (HTMLInputElement | undefined)[] = new Array(allChains.length);
	inputs.fill(undefined);

	$: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px`;

	function handleKeydown(event: KeyboardEvent) {
		if (keyboardShortcutsEnabled) {
			const chain = keyboardShortcutToChain.get(event.key);

			if (chain !== undefined) {
				inputs[chain]?.focus();
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div>
	<fieldset style="font-size: {Math.floor(buttonSize * 0.4)}px">
		<legend>{typeToInstructions.get(type)}</legend>
		{#each allChains as chain}
			{#if availableChains.indexOf(chain) >= 0}
				<input
					type="button"
					class={`hotelButton ${gameBoardTypeToCSSClassName.get(chain)}`}
					style={buttonStyle}
					value={gameBoardTypeToHotelInitial.get(chain)}
					bind:this={inputs[chain]}
					on:click={() => onChainSelected(chain)}
				/>
			{:else}
				<input
					type="button"
					class="invisible"
					style={buttonStyle}
					value="?"
					bind:this={inputs[chain]}
				/>
			{/if}
		{/each}
	</fieldset>
</div>

<style>
	fieldset {
		display: inline-block;
		margin: 0;
		padding: 0 3px 3px;
	}

	legend {
		padding: 0 5px;
	}

	input:not(:last-child) {
		margin-right: 4px;
	}
</style>
