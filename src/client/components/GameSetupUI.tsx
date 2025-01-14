import { createMemo, For, Match, Show, Switch } from 'solid-js';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';
import { allGameModes, gameModeToString, teamNumberToCSSClassName } from '../helpers';
import styles from './GameSetupUI.module.css';

export function GameSetupUI(props: {
  gameMode: PB_GameMode;
  playerArrangementMode: PB_PlayerArrangementMode;
  usernames: (string | null)[];
  userIDs: (number | null)[];
  approvals: boolean[];
  hostUserID: number;
  myUserID: number;
  onChangeGameMode: ((gameMode: PB_GameMode) => void) | undefined;
  onChangePlayerArrangementMode:
    | ((playerArrangementMode: PB_PlayerArrangementMode) => void)
    | undefined;
  onSwapPositions: ((position1: number, position2: number) => void) | undefined;
  onKickUser: ((userID: number) => void) | undefined;
  onApprove: (() => void) | undefined;
}) {
  const numUsersInGame = createMemo(() =>
    props.usernames.reduce((count, username) => count + (username !== null ? 1 : 0), 0),
  );

  const gameIsFull = createMemo(() => numUsersInGame() === props.usernames.length);

  const isTeamGame = createMemo(() => gameModeToTeamSize.get(props.gameMode)! > 1);

  const numTeams = createMemo(
    () => gameModeToNumPlayers.get(props.gameMode)! / gameModeToTeamSize.get(props.gameMode)!,
  );

  return (
    <div class={styles.root}>
      <div>
        Game mode:{' '}
        <Show
          when={props.onChangeGameMode !== undefined}
          fallback={gameModeToString.get(props.gameMode)}
        >
          <select
            value={props.gameMode}
            onChange={(event) => props.onChangeGameMode!(parseInt(event.currentTarget.value, 10))}
          >
            <For each={allGameModes}>
              {(gameMode) => (
                <option
                  value={gameMode}
                  disabled={(gameModeToNumPlayers.get(gameMode) ?? 0) < numUsersInGame()}
                >
                  {gameModeToString.get(gameMode)}
                </option>
              )}
            </For>
          </select>
        </Show>
      </div>

      <div>
        Player arrangement mode:{' '}
        <Show
          when={props.onChangePlayerArrangementMode !== undefined}
          fallback={playerArrangementModeToString.get(props.playerArrangementMode)}
        >
          <select
            value={props.playerArrangementMode}
            onChange={(event) =>
              props.onChangePlayerArrangementMode!(parseInt(event.currentTarget.value, 10))
            }
          >
            <For each={allPlayerArrangementModes}>
              {(playerArrangementMode) => (
                <Show
                  when={
                    playerArrangementMode !== PB_PlayerArrangementMode.SPECIFY_TEAMS || isTeamGame()
                  }
                >
                  <option value={playerArrangementMode}>
                    {playerArrangementModeToString.get(playerArrangementMode)}
                  </option>
                </Show>
              )}
            </For>
          </select>
        </Show>
      </div>

      <table>
        <tbody>
          <Switch>
            <Match when={props.playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER}>
              <For each={props.usernames}>
                {(username, index) => (
                  <tr>
                    <td class={styles.user} title={username ?? undefined}>
                      {username ?? ''}
                    </td>
                    <GameSetupUIKickUserAndApproveCells
                      userID={props.userIDs[index()]}
                      hostUserID={props.hostUserID}
                      myUserID={props.myUserID}
                      gameIsFull={gameIsFull()}
                      approved={props.approvals[index()]}
                      onKickUser={props.onKickUser}
                      onApprove={props.onApprove}
                    />
                  </tr>
                )}
              </For>
            </Match>
            <Match when={props.playerArrangementMode === PB_PlayerArrangementMode.EXACT_ORDER}>
              <For each={props.usernames}>
                {(username, index) => (
                  <tr>
                    <td
                      class={
                        isTeamGame()
                          ? teamNumberToCSSClassName.get((index() % numTeams()) + 1)
                          : styles.user
                      }
                    >
                      {username ?? ''}
                    </td>
                    <Show when={props.onSwapPositions !== undefined}>
                      <td>
                        <Show when={index() > 0}>
                          <input
                            type="button"
                            value="▲"
                            disabled={props.userIDs[index()] === props.userIDs[index() - 1]}
                            onClick={() => props.onSwapPositions!(index(), index() - 1)}
                          />
                        </Show>
                      </td>
                      <td>
                        <Show when={index() < props.usernames.length - 1}>
                          <input
                            type="button"
                            value="▼"
                            disabled={props.userIDs[index()] === props.userIDs[index() + 1]}
                            onClick={() => props.onSwapPositions!(index(), index() + 1)}
                          />
                        </Show>
                      </td>
                    </Show>
                    <GameSetupUIKickUserAndApproveCells
                      userID={props.userIDs[index()]}
                      hostUserID={props.hostUserID}
                      myUserID={props.myUserID}
                      gameIsFull={gameIsFull()}
                      approved={props.approvals[index()]}
                      onKickUser={props.onKickUser}
                      onApprove={props.onApprove}
                    />
                  </tr>
                )}
              </For>
            </Match>
            <Match when={props.playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS}>
              <For each={teamGameModeToSpecifyTeamsEntries.get(props.gameMode)!}>
                {(entry) => (
                  <Switch>
                    <Match when={entry !== null}>
                      <tr>
                        <td class={styles.user}>{props.usernames[entry!.index] ?? ''}</td>
                        <Show when={props.onSwapPositions !== undefined}>
                          <td>
                            <Show when={entry!.upIndex !== null}>
                              <input
                                type="button"
                                value="▲"
                                disabled={
                                  props.userIDs[entry!.index] === props.userIDs[entry!.upIndex!]
                                }
                                onClick={() => {
                                  if (entry! && entry!.upIndex !== null) {
                                    props.onSwapPositions!(entry!.index, entry!.upIndex);
                                  }
                                }}
                              />
                            </Show>
                          </td>
                          <td>
                            <Show when={entry!.downIndex !== null}>
                              <input
                                type="button"
                                value="▼"
                                disabled={
                                  props.userIDs[entry!.index] === props.userIDs[entry!.downIndex!]
                                }
                                onClick={() => {
                                  if (entry! && entry!.downIndex !== null) {
                                    props.onSwapPositions!(entry!.index, entry!.downIndex);
                                  }
                                }}
                              />
                            </Show>
                          </td>
                        </Show>
                        <GameSetupUIKickUserAndApproveCells
                          userID={props.userIDs[entry!.index]}
                          hostUserID={props.hostUserID}
                          myUserID={props.myUserID}
                          gameIsFull={gameIsFull()}
                          approved={props.approvals[entry!.index]}
                          onKickUser={props.onKickUser}
                          onApprove={props.onApprove}
                        />
                      </tr>
                    </Match>
                    <Match when={true}>
                      <tr class={styles.versus}>
                        <td>versus</td>
                      </tr>
                    </Match>
                  </Switch>
                )}
              </For>
            </Match>
          </Switch>
        </tbody>
      </table>
    </div>
  );
}

function GameSetupUIKickUserAndApproveCells(props: {
  userID: number | null;
  hostUserID: number;
  myUserID: number;
  gameIsFull: boolean;
  approved: boolean;
  onKickUser: ((userID: number) => void) | undefined;
  onApprove: (() => void) | undefined;
}) {
  return (
    <>
      <Show when={props.onKickUser}>
        <td>
          <Show when={props.userID !== null && props.userID !== props.hostUserID}>
            <input
              type="button"
              value="Kick"
              onClick={() => {
                if (props.userID) {
                  props.onKickUser!(props.userID);
                }
              }}
            />
          </Show>
        </td>
      </Show>
      <Show when={props.gameIsFull}>
        <Switch>
          <Match when={props.approved}>
            <td class={styles.ready}>Ready</td>
          </Match>
          <Match when={props.userID === props.myUserID}>
            <td>
              <input type="button" value="Ready" onClick={() => props.onApprove?.()} />
            </td>
          </Match>
          <Match when={true}>
            <td class={styles.waiting}>Waiting</td>
          </Match>
        </Switch>
      </Show>
    </>
  );
}

const playerArrangementModeToString = new Map([
  [PB_PlayerArrangementMode.RANDOM_ORDER, 'Random Order'],
  [PB_PlayerArrangementMode.EXACT_ORDER, 'Exact Order'],
  [PB_PlayerArrangementMode.SPECIFY_TEAMS, 'Specify Teams'],
]);

const allPlayerArrangementModes = [
  PB_PlayerArrangementMode.RANDOM_ORDER,
  PB_PlayerArrangementMode.EXACT_ORDER,
  PB_PlayerArrangementMode.SPECIFY_TEAMS,
];

class SpecifyTeamsEntry {
  constructor(
    public index: number,
    public upIndex: number | null,
    public downIndex: number | null,
  ) {}
}

const teamGameModeToSpecifyTeamsEntries = new Map([
  [
    PB_GameMode.TEAMS_2_VS_2,
    [
      new SpecifyTeamsEntry(0, null, 2),
      new SpecifyTeamsEntry(2, 0, 1),
      null,
      new SpecifyTeamsEntry(1, 2, 3),
      new SpecifyTeamsEntry(3, 1, null),
    ],
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
