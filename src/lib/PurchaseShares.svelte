<svelte:options immutable />

<script lang="ts" context="module">
	enum AvailableButtonStatus {
		Enabled,
		Disabled,
		Invisible,
	}

	const keyboardShortcutToAddedChain = new Map([
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

	const keyboardShortcutToRemovedChain = new Map([
		['!', 0],
		['L', 0],
		['@', 1],
		['T', 1],
		['#', 2],
		['A', 2],
		['$', 3],
		['F', 3],
		['%', 4],
		['W', 4],
		['^', 5],
		['C', 5],
		['&', 6],
		['I', 6],
	]);
</script>

<script lang="ts">
	import type { PB_GameBoardType } from '$common/pb';
	import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from './helpers';

	export let scoreBoardAvailable: number[];
	export let scoreBoardPrice: number[];
	export let cash: number;
	export let buttonSize: number;
	export let keyboardShortcutsEnabled: boolean;
	export let onSharesPurchased: (chains: PB_GameBoardType[], endGame: boolean) => void;

	let availableButtonStatuses: AvailableButtonStatus[] = [];
	let costTotal = 0;
	let costLeft = 0;
	let cart: (number | null)[] = [null, null, null];
	let endGame = false;

	$: {
		const chainToNumSharesInCart = new Map<number, number>();
		costTotal = 0;
		let numItemsInCart = 0;
		for (let i = 0; i < cart.length; i++) {
			const chain = cart[i];
			if (chain !== null) {
				chainToNumSharesInCart.set(chain, (chainToNumSharesInCart.get(chain) ?? 0) + 1);
				costTotal += scoreBoardPrice[chain];
				numItemsInCart++;
			}
		}
		costLeft = cash - costTotal;

		availableButtonStatuses = allChains.map((chain) => {
			const numAvailable = scoreBoardAvailable[chain];
			const price = scoreBoardPrice[chain];

			if (price > 0 && numAvailable > 0) {
				const numRemaining = numAvailable - (chainToNumSharesInCart.get(chain) ?? 0);
				const canAddThis = numItemsInCart < 3 && numRemaining > 0 && price <= costLeft;

				return canAddThis ? AvailableButtonStatus.Enabled : AvailableButtonStatus.Disabled;
			} else {
				return AvailableButtonStatus.Invisible;
			}
		});
	}

	const availableButtons: (HTMLInputElement | undefined)[] = new Array(allChains.length);
	availableButtons.fill(undefined);
	let endGameCheckbox: HTMLInputElement | undefined;
	let okButton: HTMLInputElement | undefined;

	$: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px`;
	$: cartButtonStyle = `width: ${Math.floor(buttonSize * (4 / 3))}px; height: ${buttonSize}px`;

	function handleKeydown(event: KeyboardEvent) {
		if (keyboardShortcutsEnabled) {
			const key = event.key;

			const addedChain = keyboardShortcutToAddedChain.get(key);
			const removedChain = keyboardShortcutToRemovedChain.get(key);

			if (addedChain !== undefined) {
				const button = availableButtons[addedChain];
				if (button) {
					button.focus();
					button.click();
				}
			} else if (removedChain !== undefined) {
				for (let i = cart.length - 1; i >= 0; i--) {
					if (cart[i] === removedChain) {
						cart = [...cart];
						cart[i] = null;
						break;
					}
				}
			} else if (key === 'Backspace' || key === '-') {
				for (let i = cart.length - 1; i >= 0; i--) {
					if (cart[i] !== null) {
						cart = [...cart];
						cart[i] = null;
						break;
					}
				}
			} else if (key === 'e' || key === '*') {
				endGame = !endGame;
				endGameCheckbox?.focus();
			} else if (key === '0' || key === '8' || key === 'o') {
				okButton?.focus();
			}
		}
	}

	function handleOK() {
		const chains: PB_GameBoardType[] = [];
		for (let i = 0; i < cart.length; i++) {
			const entry = cart[i];
			if (entry !== null) {
				chains.push(entry);
			}
		}

		onSharesPurchased(chains, endGame);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div style="font-size: {Math.floor(buttonSize * 0.4)}px">
	<div class="topRow">
		<fieldset>
			<legend>Available</legend>
			{#each availableButtonStatuses as availableButtonStatus, chain}
				<input
					type="button"
					class={`hotelButton ${gameBoardTypeToCSSClassName.get(chain)}`}
					class:invisible={availableButtonStatus === AvailableButtonStatus.Invisible}
					disabled={availableButtonStatus !== AvailableButtonStatus.Enabled}
					style={buttonStyle}
					value={gameBoardTypeToHotelInitial.get(chain)}
					bind:this={availableButtons[chain]}
					on:click={() => {
						for (let i = 0; i < cart.length; i++) {
							if (cart[i] === null) {
								cart = [...cart];
								cart[i] = chain;
								break;
							}
						}
					}}
				/>
				{' '}
			{/each}
		</fieldset>
		<fieldset>
			<legend>Cost</legend>
			<table>
				<tbody>
					<tr>
						<td>Total</td>
						<td>{costTotal * 100}</td>
					</tr>
					<tr>
						<td>Left</td>
						<td>{costLeft * 100}</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	</div>
	<div>
		<fieldset>
			<legend>Cart</legend>
			{#each cart as chain, i}
				<input
					type="button"
					class={`hotelButton ${gameBoardTypeToCSSClassName.get(chain ?? 0)}`}
					class:invisible={chain === null}
					style={cartButtonStyle}
					value={scoreBoardPrice[chain ?? 0] * 100}
					on:click={() => {
						cart = [...cart];
						cart[i] = null;
					}}
				/>
				{' '}
			{/each}
		</fieldset>
		<label>
			<input type="checkbox" bind:checked={endGame} bind:this={endGameCheckbox} />
			End game</label
		>
		<input type="button" value="OK" bind:this={okButton} on:click={handleOK} />
	</div>
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

	input:disabled {
		background-color: #d3d3d3;
		color: #555555;
	}

	label {
		margin-right: 4px;
	}

	.topRow fieldset {
		vertical-align: top;
	}

	table {
		border-collapse: collapse;
		border-spacing: 0;
	}

	td:nth-child(1) {
		text-align: left;
	}

	td:nth-child(2) {
		text-align: right;
		width: 4em;
	}
</style>
