import { useNavigate } from '@solidjs/router';
import { createEffect, For, Show } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { PB_GameBoardType, PB_GameMode } from '../../../common/pb.js';
import { User } from '../../../common/user.js';
import { type Client } from '../../client.js';
import { CreateGame } from '../../components/CreateGame.jsx';
import { GameListing } from '../../components/GameListing.jsx';
import { Username } from '../../components/Username.jsx';
import { GameStatus } from '../../helpers.js';
import * as styles from './LobbyPage.module.css';

export function LobbyPage(props: { client: Client }) {
  // eslint-disable-next-line solid/reactivity
  const lobbyManager = props.client.connectToLobby();

  const navigate = useNavigate();
  createEffect(() => {
    const createdGameNumber = lobbyManager.signals.createdGameNumber();
    if (createdGameNumber !== undefined) {
      navigate(`/game/${props.client.logTime}-${createdGameNumber}`);
    }
  });

  return (
    <Show when={lobbyManager.signals.connected()}>
      <div class={styles.root}>
        <div class={styles.gameListings}>
          <Show when={props.client.signals.user() !== null}>
            <div class={styles.createGameWrapper}>
              <CreateGame
                initialGameMode={PB_GameMode.SINGLES_4}
                onSubmit={lobbyManager.createGame}
              />
            </div>
          </Show>
          {/* This makes the game listings div always have the maximum width of an individual GameListing component */}
          <div class={styles.invisibleGameListing}>
            <GameListing
              gameBoard={[[PB_GameBoardType.NOTHING]]}
              users={dummyUsers}
              gameDisplayNumber={0}
              gameMode={PB_GameMode.TEAMS_2_VS_2_VS_2}
              gameStatus={GameStatus.SETTING_UP}
              usersInRoom={new Set()}
            />
          </div>
          <TransitionGroup
            enterClass={styles.gameListingEnter}
            enterActiveClass={styles.gameListingEnterActive}
            exitToClass={styles.gameListingExitTo}
            exitActiveClass={styles.gameListingExitActive}
          >
            <For each={lobbyManager.signals.lobbyGames()}>
              {(lobbyGame) => (
                <div>
                  <a href={`/game/${props.client.logTime}-${lobbyGame.gameNumber}`}>
                    <GameListing
                      gameBoard={lobbyGame.signals.gameBoard()}
                      users={lobbyGame.signals.users()}
                      gameDisplayNumber={lobbyGame.gameDisplayNumber}
                      gameMode={lobbyGame.signals.gameMode()}
                      gameStatus={lobbyGame.signals.gameStatus()}
                      usersInRoom={lobbyGame.signals.usersInRoom()}
                    />
                  </a>
                </div>
              )}
            </For>
          </TransitionGroup>
        </div>
        <div class={styles.rightSide}>
          <For each={lobbyManager.signals.users()}>
            {(user) => (
              <div>
                <Username username={user.name} />
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

const dummyUsers = [new User(-1, '')];
