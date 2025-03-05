import { createMemo, Index } from 'solid-js';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers.js';
import { type PB_GameBoardType, type PB_GameMode } from '../../common/pb.js';
import { type User } from '../../common/user.js';
import * as stylesApp from '../App.module.css';
import { gameModeToString, type GameStatus, gameStatusToString } from '../helpers.js';
import { teamNumberToCSSClassName } from '../styleHelpers.js';
import * as styles from './GameListing.module.css';
import { MiniGameBoard } from './MiniGameBoard.jsx';

export function GameListing(props: {
  gameBoard: PB_GameBoardType[][];
  users: (User | null)[];
  gameDisplayNumber: number;
  gameMode: PB_GameMode;
  gameStatus: GameStatus;
  usersInRoom: Set<User>;
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
          <Index each={props.users}>
            {(user, playerId) => (
              <tr>
                <td
                  classList={{
                    [teamNumberToCSSClassName.get((playerId % numTeams()) + 1) ?? '']: isTeamGame(),
                    [styles.player]: !isTeamGame(),
                    [stylesApp.playerMissing]: user() !== null && !props.usersInRoom.has(user()!),
                  }}
                  title={user()?.name}
                >
                  {user()?.name ?? ''}
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
