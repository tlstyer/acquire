<script lang="ts">
  import { allChains } from '$lib/helpers';
  import NextGameAction from '$lib/NextGameAction.svelte';
  import { Game } from '../../common/game';
  import { ActionDisposeOfShares } from '../../common/gameActions/disposeOfShares';
  import { ActionGameOver } from '../../common/gameActions/gameOver';
  import { ActionPlayTile } from '../../common/gameActions/playTile';
  import { ActionPurchaseShares } from '../../common/gameActions/purchaseShares';
  import { ActionSelectChainToDisposeOfNext } from '../../common/gameActions/selectChainToDisposeOfNext';
  import { ActionSelectMergerSurvivor } from '../../common/gameActions/selectMergerSurvivor';
  import { ActionSelectNewChain } from '../../common/gameActions/selectNewChain';
  import { ActionStartGame } from '../../common/gameActions/startGame';
  import { PB_GameBoardType, PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';

  const game = new Game(
    PB_GameMode.SINGLES_5,
    PB_PlayerArrangementMode.RANDOM_ORDER,
    [],
    [1, 2, 3, 4, 5],
    ['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME'],
    1,
    6,
  );
  const actions = [
    new ActionStartGame(game, 4),
    new ActionStartGame(game, 0),
    new ActionPlayTile(game, 1),
    new ActionSelectNewChain(game, 2, allChains, 107),
    new ActionSelectMergerSurvivor(
      game,
      3,
      [PB_GameBoardType.LUXOR, PB_GameBoardType.FESTIVAL, PB_GameBoardType.CONTINENTAL],
      107,
    ),
    new ActionSelectChainToDisposeOfNext(
      game,
      0,
      [PB_GameBoardType.TOWER, PB_GameBoardType.AMERICAN],
      PB_GameBoardType.CONTINENTAL,
    ),
    new ActionDisposeOfShares(game, 1, PB_GameBoardType.IMPERIAL, PB_GameBoardType.LUXOR),
    new ActionPurchaseShares(game, 2),
    new ActionGameOver(game, 3),
  ];
</script>

{#each actions as action}
  <p>
    <NextGameAction {action} />
  </p>
{/each}
