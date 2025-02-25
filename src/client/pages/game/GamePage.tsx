import { useParams } from '@solidjs/router';
import { batch, createMemo, createSignal, Index, Match, onCleanup, Show, Switch } from 'solid-js';
import { ActionGameOver } from '../../../common/gameActions/gameOver.js';
import { parseDecimalInteger } from '../../../common/helpers.js';
import { type Client } from '../../client.js';
import { GameBoard } from '../../components/GameBoard.js';
import { GameHistory } from '../../components/GameHistory.js';
import { GameSetupUI } from '../../components/GameSetupUI.js';
import { NextGameAction } from '../../components/NextGameAction.js';
import { ScoreBoard } from '../../components/ScoreBoard.js';
import { TileRackReadOnly } from '../../components/TileRackReadOnly.js';
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

  const iAmHost = createMemo(() => gameManager.signals.hostUser() === props.client.signals.user());
  const iAmInGame = createMemo(
    () =>
      props.client.signals.user() !== null &&
      gameManager.signals.users().includes(props.client.signals.user()),
  );

  const [selectedMoveIndex, setSelectedMoveIndex] = createSignal(0);

  const gameState = createMemo(() => gameManager.signals.gameStateHistory()[selectedMoveIndex()]);

  const turnPlayerId = createMemo(() =>
    gameState().nextGameAction instanceof ActionGameOver ? -1 : gameState().turnPlayerId,
  );
  const movePlayerId = createMemo(() =>
    gameState().nextGameAction instanceof ActionGameOver ? -1 : gameState().nextGameAction.playerId,
  );

  const [followedPlayerId, setFollowedPlayerId] = createSignal<number | null>(null);
  const gameBoardTileRack = createMemo(() => {
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
  });

  const [windowInnerWidth, setWindowInnerWidth] = createSignal(innerWidth);
  const [windowInnerHeight, setWindowInnerHeight] = createSignal(innerHeight);
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

  function updateWindowSizes() {
    batch(() => {
      setWindowInnerWidth(innerWidth);
      setWindowInnerHeight(innerHeight);
    });
  }
  addEventListener('resize', updateWindowSizes);
  onCleanup(() => removeEventListener('resize', updateWindowSizes));

  const keyboardShortcutsEnabled = () => props.client.signals.dialogType() === undefined;

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
              gameBoard={gameState().gameBoard}
              tileRack={gameBoardTileRack()}
              labelMode={props.client.signals.gameBoardLabelMode()}
              cellSize={gameBoardCellSize()}
              onCellClicked={undefined}
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
                />
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
                            value={playerId === followedPlayerId() ? 'Unlock' : 'Lock'}
                            onClick={() =>
                              setFollowedPlayerId((fpid) => (playerId === fpid ? null : playerId))
                            }
                          />
                        </div>
                      </Show>
                    </div>
                  )}
                </Index>
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
