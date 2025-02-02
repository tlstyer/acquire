import { useParams } from '@solidjs/router';
import { batch, createMemo, createSignal, Index, Match, onCleanup, Show, Switch } from 'solid-js';
import { ActionGameOver } from '../../../common/gameActions/gameOver';
import { parseDecimalInteger } from '../../../common/helpers';
import { type Client } from '../../client';
import { GameBoard } from '../../components/GameBoard';
import { GameHistory } from '../../components/GameHistory';
import { NextGameAction } from '../../components/NextGameAction';
import { ScoreBoard } from '../../components/ScoreBoard';
import { TileRackReadOnly } from '../../components/TileRackReadOnly';
import { GameManagerStatus } from '../../gamesManager';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents';
import styles from './GamePage.module.css';

export function GamePage(props: { client: Client }) {
  const params = useParams();
  const idParts = params.id.split('-');
  const idHasCorrectNumberOfParts = idParts.length === 2;
  const logTime = idHasCorrectNumberOfParts ? (parseDecimalInteger(idParts[0]) ?? 0) : 0; // TODO: the default of 0 might be the same as the server's current log time
  const gameNumber = idHasCorrectNumberOfParts ? (parseDecimalInteger(idParts[1]) ?? 0) : 0;

  // eslint-disable-next-line solid/reactivity
  const gameManager = props.client.connectToGame(logTime, gameNumber);

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
    if (gameManager.signals.userIds().length > 1) {
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
              <div class={styles.padded}>Setting up.</div>
            </Match>
            <Match when={true}>
              <div class={styles.rightSide}>
                <ScoreBoard
                  usernames={gameManager.signals.usernamesWithoutNulls()}
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
                      <Show when={gameManager.signals.userIds().length > 1}>
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
                  usernames={gameManager.signals.usernamesWithoutNulls()}
                  gameStateHistory={gameManager.signals.gameStateHistory()}
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
