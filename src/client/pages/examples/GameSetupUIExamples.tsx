import { createSignal, For } from 'solid-js';
import { GameSetup } from '../../../common/gameSetup';
import { PB_GameMode, PB_PlayerArrangementMode } from '../../../common/pb';
import { GameSetupUI } from '../../components/GameSetupUI';

export function GameSetupUIExamples() {
  const hostUserID = 1;

  const [gameSetup, setGameSetup] = createSignal(
    new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      hostUserID,
      getUsernameForUserID,
    ),
    {
      equals: false,
    },
  );

  const [simulatedNetworkDelay, setSimulatedNetworkDelay] = createSignal(250);

  const [nonHostUserIDs, setNonHostUserIDs] = createSignal<number[]>([]);

  let nextUserId = 2;

  const numUsersInGame = () => gameSetup().userIDsSet.size;

  const maxUsers = () => gameSetup().userIDs.length;

  function getUsernameForUserID(userID: number) {
    if (userID === hostUserID) {
      return 'Host';
    } else {
      return `User ${userID}`;
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

      <h2>{getUsernameForUserID(hostUserID)}'s view</h2>

      <p>
        <GameSetupUI
          gameMode={gameSetup().gameMode}
          playerArrangementMode={gameSetup().playerArrangementMode}
          usernames={gameSetup().usernames}
          userIDs={gameSetup().userIDs}
          approvals={gameSetup().approvals}
          hostUserID={gameSetup().hostUserID}
          myUserID={gameSetup().hostUserID}
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
          onKickUser={(userID) => {
            setTimeout(() => {
              console.log('kickUser', userID);
              setGameSetup((gs) => {
                gs.kickUser(userID);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onApprove={() => {
            setTimeout(() => {
              console.log('approve', hostUserID);
              setGameSetup((gs) => {
                gs.approve(hostUserID);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
        />
      </p>

      <For each={nonHostUserIDs()}>
        {(userID) => (
          <>
            <h2>{getUsernameForUserID(userID)}'s view</h2>

            <p>
              <input
                type="button"
                value={gameSetup().userIDsSet.has(userID) ? 'Stand Up' : 'Sit Down'}
                disabled={!gameSetup().userIDsSet.has(userID) && numUsersInGame === maxUsers}
                onClick={() => {
                  const inGameNow = gameSetup().userIDsSet.has(userID);
                  setTimeout(() => {
                    if (inGameNow) {
                      console.log('removeUser', userID);
                      setGameSetup((gs) => {
                        gs.removeUser(userID);
                        return gs;
                      });
                    } else {
                      console.log('addUser', userID);
                      setGameSetup((gs) => {
                        gs.addUser(userID);
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
                userIDs={gameSetup().userIDs}
                approvals={gameSetup().approvals}
                hostUserID={gameSetup().hostUserID}
                myUserID={userID}
                onChangeGameMode={undefined}
                onChangePlayerArrangementMode={undefined}
                onSwapPositions={undefined}
                onKickUser={undefined}
                onApprove={() => {
                  setTimeout(() => {
                    console.log('approve', userID);
                    setGameSetup((gs) => {
                      gs.approve(userID);
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
            const userID = nextUserId++;
            setNonHostUserIDs((ids) => [...ids, userID]);
          }}
        />{' '}
        <input
          type="button"
          value="Remove Users Who Are Not In The Game"
          onClick={() => {
            const filteredUserIDs = nonHostUserIDs().filter((userID) =>
              gameSetup().userIDsSet.has(userID),
            );
            if (filteredUserIDs.length !== nonHostUserIDs().length) {
              setNonHostUserIDs(filteredUserIDs);
            }
          }}
        />
      </p>
    </>
  );
}
