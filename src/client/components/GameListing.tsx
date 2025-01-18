import { createMemo, Index } from 'solid-js';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { PB_GameBoardType, PB_GameMode } from '../../common/pb';
import {
  gameModeToString,
  GameStatus,
  gameStatusToString,
  teamNumberToCSSClassName,
} from '../helpers';
import styles from './GameListing.module.css';
import { MiniGameBoard } from './MiniGameBoard';

export function GameListing(props: {
  gameBoard: PB_GameBoardType[][];
  usernames: (string | null)[];
  gameDisplayNumber: number;
  gameMode: PB_GameMode;
  gameStatus: GameStatus;
}) {
  const isTeamGame = createMemo(() => gameModeToTeamSize.get(props.gameMode)! > 1);

  const numTeams = createMemo(
    () => gameModeToNumPlayers.get(props.gameMode)! / gameModeToTeamSize.get(props.gameMode)!,
  );

  return (
    <div>
      <div class={styles.miniGameBoardWrapper}>
        <MiniGameBoard gameBoard={props.gameBoard} cellSize={15} />
      </div>{' '}
      <table class={styles.usernames}>
        <tbody>
          <Index each={props.usernames}>
            {(username, playerID) => (
              <tr>
                <td
                  class={
                    isTeamGame()
                      ? teamNumberToCSSClassName.get((playerID % numTeams()) + 1)
                      : styles.player
                  }
                  title={username() ?? undefined}
                >
                  {username() ?? ''}
                </td>
              </tr>
            )}
          </Index>
        </tbody>
      </table>{' '}
      <div class={styles.other}>
        <div>Game #{props.gameDisplayNumber}</div>
        <div>{gameModeToString.get(props.gameMode)}</div>
        <div>{gameStatusToString.get(props.gameStatus)}</div>
      </div>
    </div>
  );
}
