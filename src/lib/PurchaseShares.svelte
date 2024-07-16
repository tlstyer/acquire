<svelte:options immutable />

<script lang="ts" context="module">
  enum AvailableButtonStatus {
    Enabled,
    Disabled,
    Invisible,
  }
</script>

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import {
    KEY_SHIFT,
    allChains,
    gameBoardTypeToCSSClassName,
    gameBoardTypeToHotelInitial,
    keyboardEventCodeToGameBoardType,
    keyboardEventToKeysAlsoPressed,
  } from './helpers';

  export let scoreBoardAvailable: number[];
  export let scoreBoardPrice: number[];
  export let cash: number;
  export let buttonSize: number;
  export let keyboardShortcutsEnabled: boolean;
  export let onSharesPurchased: (chains: PB_GameBoardType[], endGame: boolean) => void;

  let availableButtonStatuses: AvailableButtonStatus[];
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

  const availableButtons: (HTMLInputElement | null)[] = new Array(allChains.length);
  availableButtons.fill(null);
  let endGameCheckbox: HTMLInputElement | null = null;
  let okButton: HTMLInputElement | null = null;

  $: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px`;
  $: cartButtonStyle = `width: ${Math.floor(buttonSize * (4 / 3))}px; height: ${buttonSize}px`;

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      const keysAlsoPressed = keyboardEventToKeysAlsoPressed(event);
      const gameBoardType = keyboardEventCodeToGameBoardType.get(event.code);

      if (keysAlsoPressed === 0) {
        if (gameBoardType !== undefined) {
          const button = availableButtons[gameBoardType];
          if (button) {
            button.focus();
            button.click();
          }

          event.preventDefault();
        } else if (
          event.code === 'Backspace' ||
          event.code === 'Delete' ||
          event.code === 'NumpadSubtract'
        ) {
          for (let i = cart.length - 1; i >= 0; i--) {
            if (cart[i] !== null) {
              cart = [...cart];
              cart[i] = null;
              break;
            }
          }

          event.preventDefault();
        } else if (event.code === 'KeyE' || event.code === 'NumpadMultiply') {
          endGameCheckbox?.focus();
          endGameCheckbox?.click();

          event.preventDefault();
        } else if (
          event.code === 'KeyO' ||
          event.code === 'Digit0' ||
          event.code === 'Numpad0' ||
          event.code === 'Digit8' ||
          event.code === 'Numpad8'
        ) {
          okButton?.focus();

          event.preventDefault();
        }
      } else if (keysAlsoPressed === KEY_SHIFT) {
        if (gameBoardType !== undefined) {
          for (let i = cart.length - 1; i >= 0; i--) {
            if (cart[i] === gameBoardType) {
              cart = [...cart];
              cart[i] = null;
              break;
            }
          }

          event.preventDefault();
        }
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
          class="hotelButton {gameBoardTypeToCSSClassName.get(chain)}"
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
          class="hotelButton {gameBoardTypeToCSSClassName.get(chain ?? 0)}"
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
      End game
    </label>
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
