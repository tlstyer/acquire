import { List } from 'immutable';
import * as React from 'react';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';
import { allGameModes, gameModeToString, teamNumberToCSSClassName } from '../helpers';
import * as style from './GameSetupUI.scss';

interface GameSetupUIProps {
  gameMode: PB_GameMode;
  playerArrangementMode: PB_PlayerArrangementMode;
  usernames: List<string | null>;
  userIDs: List<number | null>;
  approvals: List<boolean>;
  hostUserID: number;
  myUserID: number;
  onChangeGameMode?: (gameMode: PB_GameMode) => void;
  onChangePlayerArrangementMode?: (playerArrangementMode: PB_PlayerArrangementMode) => void;
  onSwapPositions?: (position1: number, position2: number) => void;
  onKickUser?: (userID: number) => void;
  onApprove?: () => void;
}

export class GameSetupUI extends React.PureComponent<GameSetupUIProps> {
  render() {
    const { gameMode, playerArrangementMode, usernames, onChangeGameMode, onChangePlayerArrangementMode } = this.props;

    let numUsersInGame = 0;
    for (let i = 0; i < usernames.size; i++) {
      const username = usernames.get(i, null);
      if (username !== null) {
        numUsersInGame++;
      }
    }

    const gameIsFull = numUsersInGame === usernames.size;

    const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;

    return (
      <div>
        Game mode:{' '}
        {onChangeGameMode !== undefined ? (
          <select
            defaultValue={gameMode.toString()}
            onChange={(event: React.FormEvent<HTMLSelectElement>) => onChangeGameMode(parseInt(event.currentTarget.value, 10))}
          >
            {allGameModes.map((gm) => (
              <option key={gm} value={gm} disabled={gameModeToNumPlayers.get(gm)! < numUsersInGame}>
                {gameModeToString.get(gm)}
              </option>
            ))}
          </select>
        ) : (
          gameModeToString.get(gameMode)
        )}
        <br />
        Player arrangement mode:{' '}
        {onChangePlayerArrangementMode !== undefined ? (
          <select
            defaultValue={playerArrangementMode.toString()}
            onChange={(event: React.FormEvent<HTMLSelectElement>) => onChangePlayerArrangementMode(parseInt(event.currentTarget.value, 10))}
          >
            {allPlayerArrangementModes.map((pam) =>
              pam !== PB_PlayerArrangementMode.SPECIFY_TEAMS || isTeamGame ? (
                <option key={pam} value={pam}>
                  {playerArrangementModeToString.get(pam)}
                </option>
              ) : undefined,
            )}
          </select>
        ) : (
          playerArrangementModeToString.get(playerArrangementMode)
        )}
        <br />
        {playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER
          ? this.renderRandomOrder(gameIsFull)
          : playerArrangementMode === PB_PlayerArrangementMode.EXACT_ORDER
          ? this.renderExactOrder(gameIsFull)
          : this.renderSpecifyTeams(gameIsFull)}
      </div>
    );
  }

  renderRandomOrder(showApprovals: boolean) {
    const { usernames } = this.props;

    return (
      <table className={style.table}>
        <tbody>
          {usernames.map((username, i) => (
            <tr key={i}>
              <td className={style.user}>{username}</td>
              {this.renderKickUserCell(i)}
              {showApprovals ? this.renderApproveCell(i) : undefined}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  renderExactOrder(showApprovals: boolean) {
    const { gameMode, usernames, onSwapPositions } = this.props;

    const lastIndex = usernames.size - 1;

    const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
    const numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;

    return (
      <table className={style.table}>
        <tbody>
          {usernames.map((username, i) => (
            <tr key={i}>
              <td className={isTeamGame ? teamNumberToCSSClassName.get((i % numTeams) + 1) : style.user}>{username}</td>
              {onSwapPositions !== undefined ? (
                <td>{i > 0 ? <input type={'button'} value={'▲'} onClick={() => onSwapPositions(i, i - 1)} /> : undefined}</td>
              ) : undefined}
              {onSwapPositions !== undefined ? (
                <td>{i < lastIndex ? <input type={'button'} value={'▼'} onClick={() => onSwapPositions(i, i + 1)} /> : undefined}</td>
              ) : undefined}
              {this.renderKickUserCell(i)}
              {showApprovals ? this.renderApproveCell(i) : undefined}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  renderSpecifyTeams(showApprovals: boolean) {
    const { gameMode, usernames, onSwapPositions } = this.props;

    const specifyTeamsEntries = teamGameModeToSpecifyTeamsEntries.get(gameMode)!;

    return (
      <table className={style.table}>
        <tbody>
          {specifyTeamsEntries.map((entry, i) => {
            if (entry !== null) {
              const { index, upIndex, downIndex } = entry;

              return (
                <tr key={i}>
                  <td className={style.user}>{usernames.get(index)}</td>
                  {onSwapPositions !== undefined ? (
                    <td>{upIndex !== null ? <input type={'button'} value={'▲'} onClick={() => onSwapPositions(index, upIndex)} /> : undefined}</td>
                  ) : undefined}
                  {onSwapPositions !== undefined ? (
                    <td>{downIndex !== null ? <input type={'button'} value={'▼'} onClick={() => onSwapPositions(index, downIndex)} /> : undefined}</td>
                  ) : undefined}
                  {this.renderKickUserCell(index)}
                  {showApprovals ? this.renderApproveCell(index) : undefined}
                </tr>
              );
            } else {
              return (
                <tr key={i} className={style.versus}>
                  <td>versus</td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    );
  }

  renderKickUserCell(index: number) {
    const { userIDs, hostUserID, onKickUser } = this.props;

    if (onKickUser !== undefined) {
      const userID = userIDs.get(index, null);

      return <td>{userID !== null && userID !== hostUserID ? <input type={'button'} value={'Kick'} onClick={() => onKickUser(userID)} /> : undefined}</td>;
    }
  }

  renderApproveCell(index: number) {
    const { userIDs, approvals, myUserID, onApprove } = this.props;

    const approved = approvals.get(index)!;

    if (approved) {
      return <td className={style.ready}>Ready</td>;
    } else {
      const userID = userIDs.get(index, null);
      if (userID === myUserID) {
        return (
          <td>
            <input type={'button'} value={'Ready'} onClick={onApprove} />
          </td>
        );
      } else {
        return <td className={style.waiting}>Waiting</td>;
      }
    }
  }
}

const playerArrangementModeToString = new Map([
  [PB_PlayerArrangementMode.RANDOM_ORDER, 'Random Order'],
  [PB_PlayerArrangementMode.EXACT_ORDER, 'Exact Order'],
  [PB_PlayerArrangementMode.SPECIFY_TEAMS, 'Specify Teams'],
]);

const allPlayerArrangementModes = [PB_PlayerArrangementMode.RANDOM_ORDER, PB_PlayerArrangementMode.EXACT_ORDER, PB_PlayerArrangementMode.SPECIFY_TEAMS];

class SpecifyTeamsEntry {
  constructor(public index: number, public upIndex: number | null, public downIndex: number | null) {}
}

const teamGameModeToSpecifyTeamsEntries = new Map([
  [
    PB_GameMode.TEAMS_2_VS_2,
    [new SpecifyTeamsEntry(0, null, 2), new SpecifyTeamsEntry(2, 0, 1), null, new SpecifyTeamsEntry(1, 2, 3), new SpecifyTeamsEntry(3, 1, null)],
  ],
  [
    PB_GameMode.TEAMS_2_VS_2_VS_2,
    [
      new SpecifyTeamsEntry(0, null, 3),
      new SpecifyTeamsEntry(3, 0, 1),
      null,
      new SpecifyTeamsEntry(1, 3, 4),
      new SpecifyTeamsEntry(4, 1, 2),
      null,
      new SpecifyTeamsEntry(2, 4, 5),
      new SpecifyTeamsEntry(5, 2, null),
    ],
  ],
  [
    PB_GameMode.TEAMS_3_VS_3,
    [
      new SpecifyTeamsEntry(0, null, 2),
      new SpecifyTeamsEntry(2, 0, 4),
      new SpecifyTeamsEntry(4, 2, 1),
      null,
      new SpecifyTeamsEntry(1, 4, 3),
      new SpecifyTeamsEntry(3, 1, 5),
      new SpecifyTeamsEntry(5, 3, null),
    ],
  ],
]);
