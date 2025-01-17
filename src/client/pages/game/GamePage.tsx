import { batch, createMemo, createSignal, Index, onCleanup, Show } from 'solid-js';
import { ActionGameOver } from '../../../common/gameActions/gameOver';
import { GameBoard } from '../../components/GameBoard';
import { GameHistory } from '../../components/GameHistory';
import { NextGameAction } from '../../components/NextGameAction';
import { ScoreBoard } from '../../components/ScoreBoard';
import { TileRackReadOnly } from '../../components/TileRackReadOnly';
import { GameBoardLabelMode } from '../../helpers';
import { getExampleGame1 } from '../examples/games';
import styles from './GamePage.module.css';

export function GamePage() {
  const game = getExampleGame1();

  const [selectedMoveIndex, setSelectedMoveIndex] = createSignal(game.gameStateHistory.length - 1);

  const gameState = createMemo(() => game.gameStateHistory[selectedMoveIndex()]);

  const turnPlayerID = createMemo(() =>
    gameState().nextGameAction instanceof ActionGameOver ? -1 : gameState().turnPlayerID,
  );
  const movePlayerID = createMemo(() =>
    gameState().nextGameAction instanceof ActionGameOver ? -1 : gameState().nextGameAction.playerID,
  );

  const [followedPlayerID, setFollowedPlayerID] = createSignal<number | null>(null);
  const gameBoardTileRack = createMemo(() => {
    if (game.userIDs.length > 1) {
      const fpid = followedPlayerID();
      if (fpid !== null) {
        return gameState().tileRacks[fpid];
      }

      const mpid = movePlayerID();
      if (mpid !== -1) {
        return gameState().tileRacks[mpid];
      }
    } else {
      return gameState().tileRacks[0];
    }
  });

  const [windowInnerWidth, setWindowInnerWidth] = createSignal(window.innerWidth);
  const [windowInnerHeight, setWindowInnerHeight] = createSignal(window.innerHeight);
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
      setWindowInnerWidth(window.innerWidth);
      setWindowInnerHeight(window.innerHeight);
    });
  }
  window.addEventListener('resize', updateWindowSizes);
  onCleanup(() => window.removeEventListener('resize', updateWindowSizes));

  return (
    <div class={styles.root}>
      <GameBoard
        gameBoard={gameState().gameBoard}
        tileRack={gameBoardTileRack()}
        labelMode={GameBoardLabelMode.Nothing}
        cellSize={gameBoardCellSize()}
        onCellClicked={undefined}
      />
      <div class={styles.rightSide}>
        <ScoreBoard
          usernames={game.usernames}
          scoreBoard={gameState().scoreBoard}
          scoreBoardAvailable={gameState().scoreBoardAvailable}
          scoreBoardChainSize={gameState().scoreBoardChainSize}
          scoreBoardPrice={gameState().scoreBoardPrice}
          safeChains={gameState().safeChains}
          turnPlayerID={turnPlayerID()}
          movePlayerID={movePlayerID()}
          gameMode={game.gameMode}
          cellWidth={scoreBoardCellWidth()}
        />
        <Index each={gameState().tileRacks}>
          {(tileRack, playerID) => (
            <div>
              <div class={styles.tileRackWrapper}>
                <TileRackReadOnly
                  tiles={tileRack()}
                  types={gameState().tileRackTypes[playerID]}
                  buttonSize={gameBoardCellSize()}
                />
              </div>
              <Show when={game.userIDs.length > 1}>
                <div class={styles.buttonWrapper} style={{ height: `${gameBoardCellSize()}px` }}>
                  <input
                    type="button"
                    value={playerID === followedPlayerID() ? 'Unlock' : 'Lock'}
                    onClick={() =>
                      setFollowedPlayerID((fpid) => (playerID === fpid ? null : playerID))
                    }
                  />
                </div>
              </Show>
            </div>
          )}
        </Index>
        <GameHistory
          usernames={game.usernames}
          gameStateHistory={game.gameStateHistory}
          onMoveSelected={setSelectedMoveIndex}
        />
        <NextGameAction action={gameState().nextGameAction} />
      </div>
    </div>
  );
}
