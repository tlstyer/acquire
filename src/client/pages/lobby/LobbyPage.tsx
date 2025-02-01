import { useNavigate } from '@solidjs/router';
import { createEffect, For, Show } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { PB_GameBoardType, PB_GameMode } from '../../../common/pb';
import { Client } from '../../client';
import { CreateGame } from '../../components/CreateGame';
import { GameListing } from '../../components/GameListing';
import { Username } from '../../components/Username';
import { GameStatus } from '../../helpers';
import styles from './LobbyPage.module.css';

export function LobbyPage(props: { client: Client }) {
  // eslint-disable-next-line solid/reactivity
  props.client.connectToLobby();

  const navigate = useNavigate();
  createEffect(() => {
    const createdGameNumber = props.client.lobbyManager.signals.createdGameNumber();
    if (createdGameNumber !== undefined) {
      navigate(`/game/${props.client.logTime}-${createdGameNumber}`);
    }
  });

  return (
    <Show when={props.client.lobbyManager.signals.connected()}>
      <div class={styles.root}>
        <div class={styles.gameListings}>
          <CreateGame
            initialGameMode={PB_GameMode.SINGLES_4}
            onSubmit={props.client.lobbyManager.createGame}
          />
          {/* This makes the game listings div always have the maximum width of an individual GameListing component */}
          <div class={styles.invisibleGameListing}>
            <GameListing
              gameBoard={[[PB_GameBoardType.NOTHING]]}
              usernames={['']}
              gameDisplayNumber={0}
              gameMode={PB_GameMode.TEAMS_2_VS_2_VS_2}
              gameStatus={GameStatus.SETTING_UP}
            />
          </div>
          <TransitionGroup
            enterClass={styles.gameListingEnter}
            enterActiveClass={styles.gameListingEnterActive}
            exitToClass={styles.gameListingExitTo}
            exitActiveClass={styles.gameListingExitActive}
          >
            <For each={props.client.lobbyManager.signals.lobbyGames()}>
              {(lobbyGame) => (
                <div>
                  <a href={`/game/${props.client.logTime}-${lobbyGame.gameNumber}`}>
                    <GameListing
                      gameBoard={lobbyGame.signals.gameBoard()}
                      usernames={lobbyGame.signals.usernames()}
                      gameDisplayNumber={lobbyGame.gameDisplayNumber}
                      gameMode={lobbyGame.signals.gameMode()}
                      gameStatus={lobbyGame.signals.gameStatus()}
                    />
                  </a>
                </div>
              )}
            </For>
          </TransitionGroup>
        </div>
        <div class={styles.rightSide}>
          <For each={props.client.lobbyManager.signals.usernames()}>
            {(username) => (
              <div>
                <Username username={username} />
              </div>
            )}
          </For>
          <h2>Links</h2>
          <ul>
            <li>
              <a href="/examples">Examples</a>
            </li>
          </ul>
        </div>
      </div>
    </Show>
  );
}
