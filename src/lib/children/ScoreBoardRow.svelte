<svelte:options immutable />

<script lang="ts">
  import { ScoreBoardIndexEnum } from '../../common/enums';
  import { teamNumberToCSSClassName } from '../helpers';

  export let isPlayerRow: boolean;
  export let title: string;
  export let isPlayersTurn: boolean;
  export let isPlayersMove: boolean;
  export let scoreBoardRow: number[];
  export let safeChains: boolean[];
  export let defaultClassName: string;
  export let zeroValueReplacement: string;
  export let teamNumber: number | undefined = undefined;
  export let teamTotal: number | undefined = undefined;
</script>

<tr class={defaultClassName}>
  <td
    class={isPlayersTurn
      ? 'isPlayersTurn'
      : isPlayersMove
        ? 'isPlayersMove'
        : isPlayerRow
          ? 'player'
          : undefined}
    title={isPlayerRow ? title : undefined}
  >
    {title}
  </td>

  {#each safeChains as isSafe, chain}
    <td class:safeChain={isSafe}>
      {scoreBoardRow[chain] === 0 ? zeroValueReplacement : scoreBoardRow[chain]}
    </td>
  {/each}

  {#if isPlayerRow}
    <td>{scoreBoardRow[ScoreBoardIndexEnum.Cash] * 100}</td>
    <td>{scoreBoardRow[ScoreBoardIndexEnum.Net] * 100}</td>
  {:else}
    <td class="notTeamScore">
      {teamNumber !== undefined ? `Team ${teamNumber}` : ''}
    </td>
    <td
      class={teamNumber !== undefined ? teamNumberToCSSClassName.get(teamNumber) : undefined}
      class:teamScore={teamNumber !== undefined}
      class:notTeamScore={teamNumber === undefined}
    >
      {teamTotal !== undefined ? teamTotal * 100 : ''}
    </td>
  {/if}
</tr>

<style>
  .isPlayersTurn {
    background-color: #ffc0c0;
  }

  .isPlayersMove {
    background-color: #ffe0e0;
  }

  .safeChain {
    background-color: #ffc080;
  }

  .notTeamScore {
    background-color: var(--main-background-color);
    border-color: var(--main-background-color);
  }

  .teamScore {
    border-color: var(--border-color);
    border-style: double;
  }
</style>
