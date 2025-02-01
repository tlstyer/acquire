import { createSignal, For } from 'solid-js';
import { GameSetup } from '../../../common/gameSetup';
import { PB_GameMode, PB_PlayerArrangementMode } from '../../../common/pb';
import { GameSetupUI } from '../../components/GameSetupUI';

export function GameSetupUIExamples() {
  const hostUserId = 1;

  const [gameSetup, setGameSetup] = createSignal(
    new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      hostUserId,
      getUsernameForUserId,
    ),
    {
      equals: false,
    },
  );

  const [simulatedNetworkDelay, setSimulatedNetworkDelay] = createSignal(250);

  const [nonHostUserIds, setNonHostUserIds] = createSignal<number[]>([]);

  let nextUserId = 2;

  const numUsersInGame = () => gameSetup().userIdsSet.size;

  const maxUsers = () => gameSetup().userIds.length;

  function getUsernameForUserId(userId: number) {
    if (userId === hostUserId) {
      return 'Host';
    } else {
      return `User ${userId}`;
    }
  }

  return (
    <>
      <p>
        Simulated network delay (ms):{' '}
        <input
          type="number"
          value={simulatedNetworkDelay()}
          onInput={(e) => setSimulatedNetworkDelay(parseInt(e.currentTarget.value, 10))}
        />
      </p>

      <h2>{getUsernameForUserId(hostUserId)}'s view</h2>

      <p>
        <GameSetupUI
          gameMode={gameSetup().gameMode}
          playerArrangementMode={gameSetup().playerArrangementMode}
          usernames={gameSetup().usernames}
          userIds={gameSetup().userIds}
          approvals={gameSetup().approvals}
          hostUserId={gameSetup().hostUserId}
          myUserId={gameSetup().hostUserId}
          onChangeGameMode={(gameMode) => {
            setTimeout(() => {
              console.log('changeGameMode', gameMode);
              setGameSetup((gs) => {
                gs.changeGameMode(gameMode);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onChangePlayerArrangementMode={(playerArrangementMode) => {
            setTimeout(() => {
              console.log('changePlayerArrangementMode', playerArrangementMode);
              setGameSetup((gs) => {
                gs.changePlayerArrangementMode(playerArrangementMode);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onSwapPositions={(position1, position2) => {
            setTimeout(() => {
              console.log('swapPositions', position1, position2);
              setGameSetup((gs) => {
                gs.swapPositions(position1, position2);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onKickUser={(userId) => {
            setTimeout(() => {
              console.log('kickUser', userId);
              setGameSetup((gs) => {
                gs.kickUser(userId);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onApprove={() => {
            setTimeout(() => {
              console.log('approve', hostUserId);
              setGameSetup((gs) => {
                gs.approve(hostUserId);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
        />
      </p>

      <For each={nonHostUserIds()}>
        {(userId) => (
          <>
            <h2>{getUsernameForUserId(userId)}'s view</h2>

            <p>
              <input
                type="button"
                value={gameSetup().userIdsSet.has(userId) ? 'Stand Up' : 'Sit Down'}
                disabled={!gameSetup().userIdsSet.has(userId) && numUsersInGame === maxUsers}
                onClick={() => {
                  const inGameNow = gameSetup().userIdsSet.has(userId);
                  setTimeout(() => {
                    if (inGameNow) {
                      console.log('removeUser', userId);
                      setGameSetup((gs) => {
                        gs.removeUser(userId);
                        return gs;
                      });
                    } else {
                      console.log('addUser', userId);
                      setGameSetup((gs) => {
                        gs.addUser(userId);
                        return gs;
                      });
                    }
                  }, simulatedNetworkDelay());
                }}
              />
            </p>

            <p>
              <GameSetupUI
                gameMode={gameSetup().gameMode}
                playerArrangementMode={gameSetup().playerArrangementMode}
                usernames={gameSetup().usernames}
                userIds={gameSetup().userIds}
                approvals={gameSetup().approvals}
                hostUserId={gameSetup().hostUserId}
                myUserId={userId}
                onChangeGameMode={undefined}
                onChangePlayerArrangementMode={undefined}
                onSwapPositions={undefined}
                onKickUser={undefined}
                onApprove={() => {
                  setTimeout(() => {
                    console.log('approve', userId);
                    setGameSetup((gs) => {
                      gs.approve(userId);
                      return gs;
                    });
                  }, simulatedNetworkDelay());
                }}
              />
            </p>
          </>
        )}
      </For>

      <p>
        <input
          type="button"
          value="Add A User"
          onClick={() => {
            const userId = nextUserId++;
            setNonHostUserIds((ids) => [...ids, userId]);
          }}
        />{' '}
        <input
          type="button"
          value="Remove Users Who Are Not In The Game"
          onClick={() => {
            const filteredUserIds = nonHostUserIds().filter((userId) =>
              gameSetup().userIdsSet.has(userId),
            );
            if (filteredUserIds.length !== nonHostUserIds().length) {
              setNonHostUserIds(filteredUserIds);
            }
          }}
        />
      </p>
    </>
  );
}
