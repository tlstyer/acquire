import { useParams } from '@solidjs/router';
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  Index,
  Match,
  onCleanup,
  Show,
  Switch,
  untrack,
} from 'solid-js';
import {
  defaultGameBoard,
  defaultScoreBoardAvailable,
  defaultScoreBoardPrice,
} from '../../../common/defaults.js';
import { ScoreBoardIndexEnum } from '../../../common/enums.js';
import { ActionDisposeOfShares } from '../../../common/gameActions/disposeOfShares.js';
import { ActionGameOver } from '../../../common/gameActions/gameOver.js';
import { ActionPlayTile } from '../../../common/gameActions/playTile.js';
import { ActionPurchaseShares } from '../../../common/gameActions/purchaseShares.js';
import { ActionSelectChainToDisposeOfNext } from '../../../common/gameActions/selectChainToDisposeOfNext.js';
import { ActionSelectMergerSurvivor } from '../../../common/gameActions/selectMergerSurvivor.js';
import { ActionSelectNewChain } from '../../../common/gameActions/selectNewChain.js';
import { parseDecimalInteger } from '../../../common/helpers.js';
import { type Client } from '../../client.js';
import { DisposeOfShares } from '../../components/DisposeOfShares.jsx';
import { GameBoard } from '../../components/GameBoard.jsx';
import { GameHistory } from '../../components/GameHistory.jsx';
import { GameSetupUI } from '../../components/GameSetupUI.jsx';
import { NextGameAction } from '../../components/NextGameAction.jsx';
import { PurchaseShares } from '../../components/PurchaseShares.jsx';
import { ScoreBoard } from '../../components/ScoreBoard.jsx';
import { SelectChain, SelectChainTitle } from '../../components/SelectChain.jsx';
import { TileRack } from '../../components/TileRack.jsx';
import { TileRackReadOnly } from '../../components/TileRackReadOnly.jsx';
import { GameManagerStatus } from '../../gamesManager.js';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents.js';
import styles from './GamePage.module.css';

export function GamePage(props: { client: Client }) {
  const params = useParams();
  const idParts = params.id.split('-');
  const idHasCorrectNumberOfParts = idParts.length === 2;
  const logTime = idHasCorrectNumberOfParts ? (parseDecimalInteger(idParts[0]) ?? 0) : 0;
  const gameNumber = idHasCorrectNumberOfParts ? (parseDecimalInteger(idParts[1]) ?? 0) : 0;

  // eslint-disable-next-line solid/reactivity
  const gameManager = props.client.connectToGame(logTime, gameNumber);

  // when status is SettingUp or Game or Review

  const [windowInnerWidth, setWindowInnerWidth] = createSignal(innerWidth);
  const [windowInnerHeight, setWindowInnerHeight] = createSignal(innerHeight);

  function updateWindowSizes() {
    batch(() => {
      setWindowInnerWidth(innerWidth);
      setWindowInnerHeight(innerHeight);
    });
  }
  addEventListener('resize', updateWindowSizes);
  onCleanup(() => removeEventListener('resize', updateWindowSizes));

  const gameBoardCellSize = createMemo(() => {
    const gameBoardCellSizeBasedOnWindowWidth = windowInnerWidth() / 2 / 12;
    const gameBoardCellSizeBasedOnWindowHeight = (windowInnerHeight() - 129) / 9;
    return Math.floor(
      Math.min(gameBoardCellSizeBasedOnWindowWidth, gameBoardCellSizeBasedOnWindowHeight),
    );
  });

  const scoreBoardCellWidth = createMemo(() => {
    const gameBoardWidth = gameBoardCellSize() * 12 + 2;
    const rightSideWidth = windowInnerWidth() - gameBoardWidth - 2;
    return Math.floor(Math.min(rightSideWidth - 2, gameBoardWidth) / 18);
  });

  const keyboardShortcutsEnabled = () => props.client.signals.dialogType() === undefined;

  // when status is SettingUp

  const iAmHost = createMemo(() => gameManager.signals.hostUser() === props.client.signals.user());

  const iAmInGame = createMemo(
    () =>
      props.client.signals.user() !== null &&
      gameManager.signals.users().includes(props.client.signals.user()),
  );

  // when status is Game

  const myRequiredGameAction = gameManager.signals.myRequiredGameAction;

  // when status is Review

  const [followedPlayerId, setFollowedPlayerId] = createSignal<number | null>(null);

  // when status is Game or Review

  const [selectedMoveIndex, setSelectedMoveIndex] = createSignal(0);

  let previousGameStateHistoryLength = 0;
  createEffect(() => {
    const currentGameStateHistoryLength = gameManager.signals.gameStateHistory().length;
    if (
      currentGameStateHistoryLength !== previousGameStateHistoryLength &&
      (previousGameStateHistoryLength === 0 ||
        untrack(selectedMoveIndex) === previousGameStateHistoryLength - 1)
    ) {
      setSelectedMoveIndex(currentGameStateHistoryLength - 1);
    }

    previousGameStateHistoryLength = currentGameStateHistoryLength;
  });

  const gameState = createMemo(() => gameManager.signals.gameStateHistory()[selectedMoveIndex()]);

  const turnPlayerId = createMemo(() =>
    gameState()
      ? gameState().nextGameAction instanceof ActionGameOver
        ? -1
        : gameState().turnPlayerId
      : -1,
  );

  const movePlayerId = createMemo(() =>
    gameState()
      ? gameState().nextGameAction instanceof ActionGameOver
        ? -1
        : gameState().nextGameAction.playerId
      : -1,
  );

  const gameBoardTileRack = createMemo(() => {
    const status = gameManager.signals.status();
    if (status === GameManagerStatus.Game) {
      const playerId = gameManager.signals.myPlayerId();
      if (playerId >= 0) {
        return gameState().tileRacks[playerId];
      }
    } else if (status === GameManagerStatus.Review) {
      if (gameManager.signals.usersWithoutNulls().length > 1) {
        const fpid = followedPlayerId();
        if (fpid !== null) {
          return gameState().tileRacks[fpid];
        }

        const mpid = movePlayerId();
        if (mpid !== -1) {
          return gameState().tileRacks[mpid];
        }
      } else {
        return gameState().tileRacks[0];
      }
    }
  });

  return (
    <div class={styles.root}>
      <Switch>
        <Match when={gameManager.signals.status() === GameManagerStatus.Connecting}>
          <div class={styles.padded}>Connecting...</div>
        </Match>
        <Match when={gameManager.signals.status() === GameManagerStatus.NotFound}>
          <div class={styles.padded}>Game not found.</div>
        </Match>
        <Match when={true}>
          <div>
            <GameBoard
              gameBoard={gameState()?.gameBoard ?? defaultGameBoard}
              tileRack={gameBoardTileRack()}
              labelMode={props.client.signals.gameBoardLabelMode()}
              cellSize={gameBoardCellSize()}
              onCellClicked={
                myRequiredGameAction() instanceof ActionPlayTile
                  ? gameManager.gameActions.playTile
                  : undefined
              }
            />
          </div>
          <Switch>
            <Match when={gameManager.signals.status() === GameManagerStatus.SettingUp}>
              <div class={styles.padded}>
                <Show when={props.client.signals.user() !== null && !iAmHost()}>
                  <input
                    class={styles.sitDownInput}
                    type="button"
                    value={iAmInGame() ? 'Stand Up' : 'Sit Down'}
                    disabled={!iAmInGame() && !gameManager.signals.users().includes(null)}
                    onClick={() => {
                      if (iAmInGame()) {
                        gameManager.gameSetupActions.standUp();
                      } else {
                        gameManager.gameSetupActions.sitDown();
                      }
                    }}
                  />
                </Show>
                <GameSetupUI
                  gameMode={gameManager.signals.gameMode()}
                  playerArrangementMode={gameManager.signals.playerArrangementMode()}
                  users={gameManager.signals.users()}
                  approvals={gameManager.signals.approvals()}
                  hostUser={gameManager.signals.hostUser()}
                  myUser={props.client.signals.user()}
                  usersInRoom={gameManager.signals.usersInRoom()}
                  onChangeGameMode={
                    iAmHost() ? gameManager.gameSetupActions.changeGameMode : undefined
                  }
                  onChangePlayerArrangementMode={
                    iAmHost() ? gameManager.gameSetupActions.changePlayerArrangementMode : undefined
                  }
                  onSwapPositions={
                    iAmHost() ? gameManager.gameSetupActions.swapPositions : undefined
                  }
                  onKickUser={iAmHost() ? gameManager.gameSetupActions.kickUser : undefined}
                  onApprove={gameManager.gameSetupActions.approve}
                />
              </div>
            </Match>
            <Match when={true}>
              <div class={styles.rightSide}>
                <ScoreBoard
                  users={gameManager.signals.usersWithoutNulls()}
                  scoreBoard={gameState().scoreBoard}
                  scoreBoardAvailable={gameState().scoreBoardAvailable}
                  scoreBoardChainSize={gameState().scoreBoardChainSize}
                  scoreBoardPrice={gameState().scoreBoardPrice}
                  safeChains={gameState().safeChains}
                  turnPlayerId={turnPlayerId()}
                  movePlayerId={movePlayerId()}
                  gameMode={gameManager.signals.gameMode()}
                  cellWidth={scoreBoardCellWidth()}
                  usersInRoom={gameManager.signals.usersInRoom()}
                />
                <Switch>
                  <Match when={gameManager.signals.status() === GameManagerStatus.Game}>
                    <Show when={gameManager.signals.myPlayerId() !== -1}>
                      <TileRack
                        ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                        tiles={gameState().tileRacks[gameManager.signals.myPlayerId()]}
                        types={gameState().tileRackTypes[gameManager.signals.myPlayerId()]}
                        buttonSize={gameBoardCellSize()}
                        onTileClicked={
                          myRequiredGameAction() instanceof ActionPlayTile
                            ? gameManager.gameActions.playTile
                            : () => {}
                        }
                      />
                      <div>
                        <div class={styles.actionComponent}>
                          <Switch>
                            <Match when={myRequiredGameAction() instanceof ActionSelectNewChain}>
                              <SelectChain
                                ref={(ref) =>
                                  processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)
                                }
                                type={SelectChainTitle.SelectNewChain}
                                availableChains={
                                  (myRequiredGameAction() as ActionSelectNewChain).availableChains
                                }
                                buttonSize={gameBoardCellSize()}
                                onChainSelected={gameManager.gameActions.selectNewChain}
                              />
                            </Match>
                            <Match
                              when={myRequiredGameAction() instanceof ActionSelectMergerSurvivor}
                            >
                              <SelectChain
                                ref={(ref) =>
                                  processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)
                                }
                                type={SelectChainTitle.SelectMergerSurvivor}
                                availableChains={
                                  (myRequiredGameAction() as ActionSelectMergerSurvivor)
                                    .chainsBySize[0]
                                }
                                buttonSize={gameBoardCellSize()}
                                onChainSelected={gameManager.gameActions.selectMergerSurvivor}
                              />
                            </Match>
                            <Match
                              when={
                                myRequiredGameAction() instanceof ActionSelectChainToDisposeOfNext
                              }
                            >
                              <SelectChain
                                ref={(ref) =>
                                  processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)
                                }
                                type={SelectChainTitle.SelectChainToDisposeOfNext}
                                availableChains={
                                  (myRequiredGameAction() as ActionSelectChainToDisposeOfNext)
                                    .defunctChains
                                }
                                buttonSize={gameBoardCellSize()}
                                onChainSelected={gameManager.gameActions.selectChainToDisposeOfNext}
                              />
                            </Match>
                            <Match when={myRequiredGameAction() instanceof ActionDisposeOfShares}>
                              <DisposeOfShares
                                ref={(ref) =>
                                  processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)
                                }
                                defunctChain={
                                  (myRequiredGameAction() as ActionDisposeOfShares).defunctChain
                                }
                                controllingChain={
                                  (myRequiredGameAction() as ActionDisposeOfShares).controllingChain
                                }
                                sharesOwnedInDefunctChain={
                                  (myRequiredGameAction() as ActionDisposeOfShares)
                                    .sharesOwnedInDefunctChain
                                }
                                sharesAvailableInControllingChain={
                                  (myRequiredGameAction() as ActionDisposeOfShares)
                                    .sharesAvailableInControllingChain
                                }
                                buttonSize={gameBoardCellSize()}
                                onSharesDisposed={gameManager.gameActions.disposeOfShares}
                              />
                            </Match>
                            <Match when={myRequiredGameAction() instanceof ActionPurchaseShares}>
                              <PurchaseShares
                                ref={(ref) =>
                                  processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)
                                }
                                scoreBoardAvailable={
                                  (myRequiredGameAction() as ActionPurchaseShares).game
                                    .scoreBoardAvailable
                                }
                                scoreBoardPrice={
                                  (myRequiredGameAction() as ActionPurchaseShares).game
                                    .scoreBoardPrice
                                }
                                cash={
                                  (myRequiredGameAction() as ActionPurchaseShares).game.scoreBoard[
                                    gameManager.signals.myPlayerId()
                                  ][ScoreBoardIndexEnum.Cash]
                                }
                                buttonSize={gameBoardCellSize()}
                                onSharesPurchased={gameManager.gameActions.purchaseShares}
                              />
                            </Match>
                          </Switch>
                        </div>
                        <div class={styles.claimSpaceForActionComponents}>
                          <PurchaseShares
                            ref={(ref) => processBrowserMyKeyboardEvents(() => false, ref)}
                            scoreBoardAvailable={defaultScoreBoardAvailable}
                            scoreBoardPrice={defaultScoreBoardPrice}
                            cash={0}
                            buttonSize={gameBoardCellSize()}
                            onSharesPurchased={() => {}}
                          />
                        </div>
                      </div>
                    </Show>
                  </Match>
                  <Match when={gameManager.signals.status() === GameManagerStatus.Review}>
                    <Index each={gameState().tileRacks}>
                      {(tileRack, playerId) => (
                        <div>
                          <div class={styles.tileRackWrapper}>
                            <TileRackReadOnly
                              tiles={tileRack()}
                              types={gameState().tileRackTypes[playerId]}
                              buttonSize={gameBoardCellSize()}
                            />
                          </div>
                          <Show when={gameManager.signals.usersWithoutNulls().length > 1}>
                            <div
                              class={styles.buttonWrapper}
                              style={{ height: `${gameBoardCellSize()}px` }}
                            >
                              <input
                                type="button"
                                value={playerId === followedPlayerId() ? 'Unfollow' : 'Follow'}
                                onClick={() =>
                                  setFollowedPlayerId((fpid) =>
                                    playerId === fpid ? null : playerId,
                                  )
                                }
                              />
                            </div>
                          </Show>
                        </div>
                      )}
                    </Index>
                  </Match>
                </Switch>
                <GameHistory
                  ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                  users={gameManager.signals.usersWithoutNulls()}
                  gameStateHistory={gameManager.signals.gameStateHistory()}
                  selectedMoveIndex={selectedMoveIndex()}
                  onMoveSelected={setSelectedMoveIndex}
                />
                <NextGameAction action={gameState().nextGameAction} />
              </div>
            </Match>
          </Switch>
        </Match>
      </Switch>
    </div>
  );
}
