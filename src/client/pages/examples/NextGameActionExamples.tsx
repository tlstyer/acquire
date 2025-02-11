import { For } from 'solid-js';
import { Game } from '../../../common/game.js';
import { ActionDisposeOfShares } from '../../../common/gameActions/disposeOfShares.js';
import { ActionGameOver } from '../../../common/gameActions/gameOver.js';
import { ActionPlayTile } from '../../../common/gameActions/playTile.js';
import { ActionPurchaseShares } from '../../../common/gameActions/purchaseShares.js';
import { ActionSelectChainToDisposeOfNext } from '../../../common/gameActions/selectChainToDisposeOfNext.js';
import { ActionSelectMergerSurvivor } from '../../../common/gameActions/selectMergerSurvivor.js';
import { ActionSelectNewChain } from '../../../common/gameActions/selectNewChain.js';
import { ActionStartGame } from '../../../common/gameActions/startGame.js';
import { PB_GameBoardType, PB_GameMode, PB_PlayerArrangementMode } from '../../../common/pb.js';
import { User } from '../../../common/user.js';
import { NextGameAction } from '../../components/NextGameAction.js';
import { allChains } from '../../helpers.js';

export function NextGameActionExamples() {
  const hostUser = new User(1, 'Tim');
  const game = new Game(
    PB_GameMode.SINGLES_5,
    PB_PlayerArrangementMode.RANDOM_ORDER,
    [],
    [
      hostUser,
      new User(2, 'Rita'),
      new User(3, 'Dad'),
      new User(4, 'Mom'),
      new User(5, 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME'),
    ],
    hostUser,
    new User(6, 'user 6'),
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

  return (
    <For each={actions}>
      {(action) => (
        <p>
          <NextGameAction action={action} />
        </p>
      )}
    </For>
  );
}
