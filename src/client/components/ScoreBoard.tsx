import { createMemo, For, Index, Match, Switch } from 'solid-js';
import { ScoreBoardIndexEnum } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { PB_GameMode } from '../../common/pb';
import {
  allChains,
  gameBoardTypeToCSSClassName,
  gameBoardTypeToHotelInitial,
  teamNumberToCSSClassName,
} from '../helpers';
import styles from './ScoreBoard.module.css';

export function ScoreBoard(props: {
  usernames: string[];
  scoreBoard: number[][];
  scoreBoardAvailable: number[];
  scoreBoardChainSize: number[];
  scoreBoardPrice: number[];
  safeChains: boolean[];
  turnPlayerID: number;
  movePlayerID: number;
  gameMode: PB_GameMode;
  cellWidth: number;
}) {
  const isTeamGame = createMemo(() => gameModeToTeamSize.get(props.gameMode)! > 1);

  const numTeams = createMemo(() =>
    isTeamGame()
      ? gameModeToNumPlayers.get(props.gameMode)! / gameModeToTeamSize.get(props.gameMode)!
      : 0,
  );

  const teamNumbers = createMemo(() => numTeamsToTeamNumbers[numTeams()]);

  const teamTotals = createMemo(() => {
    if (isTeamGame()) {
      const totals: (number | undefined)[] = [0, 0, 0];
      const sb = props.scoreBoard;
      const nt = numTeams();

      for (let playerID = 0; playerID < sb.length; playerID++) {
        totals[playerID % nt]! += sb[playerID][ScoreBoardIndexEnum.Net];
      }

      if (nt === 2) {
        totals[2] = totals[1];
        totals[1] = totals[0];
        totals[0] = undefined;
      }

      return totals;
    } else {
      return defaultTeamTotals;
    }
  });

  return (
    <table
      class={styles.root}
      style={{
        'font-size': `${Math.floor(props.cellWidth * 0.6)}px`,
        width: `${props.cellWidth * 18 + 2}px`,
      }}
    >
      <tbody>
        <tr>
          <td class={styles.playerHeader}>Player</td>
          <For each={allChains}>
            {(chain) => (
              <td class={gameBoardTypeToCSSClassName.get(chain)}>
                {gameBoardTypeToHotelInitial.get(chain)}
              </td>
            )}
          </For>
          <td class={styles.cashAndNetHeader}>Cash</td>
          <td class={styles.cashAndNetHeader}>Net</td>
        </tr>

        <Index each={props.usernames}>
          {(username, playerID) => (
            <ScoreBoardRow
              isPlayerRow={true}
              title={username()}
              isPlayersTurn={playerID === props.turnPlayerID}
              isPlayersMove={playerID === props.movePlayerID}
              scoreBoardRow={props.scoreBoard[playerID]}
              safeChains={props.safeChains}
              defaultClassName={
                isTeamGame()
                  ? teamNumberToCSSClassName.get((playerID % numTeams()) + 1)!
                  : styles.player
              }
              zeroValueReplacement=""
              teamNumber={undefined}
              teamTotal={undefined}
            />
          )}
        </Index>

        <ScoreBoardRow
          isPlayerRow={false}
          title="Available"
          isPlayersTurn={false}
          isPlayersMove={false}
          scoreBoardRow={props.scoreBoardAvailable}
          safeChains={props.safeChains}
          defaultClassName={styles.availableChainSizeAndPrice}
          zeroValueReplacement="0"
          teamNumber={teamNumbers()[0]}
          teamTotal={teamTotals()[0]}
        />
        <ScoreBoardRow
          isPlayerRow={false}
          title="Chain Size"
          isPlayersTurn={false}
          isPlayersMove={false}
          scoreBoardRow={props.scoreBoardChainSize}
          safeChains={props.safeChains}
          defaultClassName={styles.availableChainSizeAndPrice}
          zeroValueReplacement="-"
          teamNumber={teamNumbers()[1]}
          teamTotal={teamTotals()[1]}
        />
        <ScoreBoardRow
          isPlayerRow={false}
          title="Price ($00)"
          isPlayersTurn={false}
          isPlayersMove={false}
          scoreBoardRow={props.scoreBoardPrice}
          safeChains={props.safeChains}
          defaultClassName={styles.availableChainSizeAndPrice}
          zeroValueReplacement="-"
          teamNumber={teamNumbers()[2]}
          teamTotal={teamTotals()[2]}
        />
      </tbody>
    </table>
  );
}

function ScoreBoardRow(props: {
  isPlayerRow: boolean;
  title: string;
  isPlayersTurn: boolean;
  isPlayersMove: boolean;
  scoreBoardRow: number[];
  safeChains: boolean[];
  defaultClassName: string;
  zeroValueReplacement: string;
  teamNumber: number | undefined;
  teamTotal: number | undefined;
}) {
  return (
    <tr class={props.defaultClassName}>
      <td
        class={
          props.isPlayersTurn
            ? styles.isPlayersTurn
            : props.isPlayersMove
              ? styles.isPlayersMove
              : props.isPlayerRow
                ? styles.player
                : undefined
        }
        title={props.isPlayerRow ? props.title : undefined}
      >
        {props.title}
      </td>

      <Index each={props.safeChains}>
        {(isSafe, chain) => (
          <td classList={{ [styles.safeChain]: isSafe() }}>
            {props.scoreBoardRow[chain] === 0
              ? props.zeroValueReplacement
              : props.scoreBoardRow[chain]}
          </td>
        )}
      </Index>

      <Switch>
        <Match when={props.isPlayerRow}>
          <td>{props.scoreBoardRow[ScoreBoardIndexEnum.Cash] * 100}</td>
          <td>{props.scoreBoardRow[ScoreBoardIndexEnum.Net] * 100}</td>
        </Match>
        <Match when={true}>
          <td class={styles.notTeamScore}>
            {props.teamNumber !== undefined ? `Team ${props.teamNumber}` : ''}
          </td>
          <td
            classList={{
              [props.teamNumber !== undefined
                ? teamNumberToCSSClassName.get(props.teamNumber)!
                : '']: true,
              [styles.teamScore]: props.teamNumber !== undefined,
              [styles.notTeamScore]: props.teamNumber === undefined,
            }}
          >
            {props.teamTotal !== undefined ? props.teamTotal * 100 : ''}
          </td>
        </Match>
      </Switch>
    </tr>
  );
}

const numTeamsToTeamNumbers = [[undefined, undefined, undefined], [], [undefined, 1, 2], [1, 2, 3]];

const defaultTeamTotals = [undefined, undefined, undefined];
