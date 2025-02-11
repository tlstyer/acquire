import { For } from 'solid-js';
import { defaultGameBoard } from '../../../common/defaults.js';
import { PB_GameMode } from '../../../common/pb.js';
import { User } from '../../../common/user.js';
import { GameListing } from '../../components/GameListing.js';
import { GameStatus } from '../../helpers.js';
import { getExampleGame1, getExampleGame2 } from './games.js';

export function GameListingExamples() {
  const allProps = [
    {
      gameBoard: defaultGameBoard,
      users: [new User(1, 'Host'), null, new User(2, 'User 2'), null],
      gameDisplayNumber: 1,
      gameMode: PB_GameMode.SINGLES_4,
      gameStatus: GameStatus.SETTING_UP,
    },
    {
      gameBoard: getExampleGame1().gameBoard,
      users: [
        new User(1, 'Tim'),
        new User(2, 'Rita'),
        new User(3, 'Dad'),
        new User(4, 'Mom'),
        new User(5, 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME'),
        new User(6, 'pgyqj,;'),
      ],
      gameDisplayNumber: 2,
      gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
      gameStatus: GameStatus.IN_PROGRESS,
    },
    {
      gameBoard: getExampleGame2().gameBoard,
      users: [
        new User(1, 'player 1'),
        new User(2, 'player 2'),
        new User(3, 'player 3'),
        new User(4, 'player 4'),
      ],
      gameDisplayNumber: 3,
      gameMode: PB_GameMode.TEAMS_2_VS_2,
      gameStatus: GameStatus.COMPLETED,
    },
  ];

  return (
    <For each={allProps}>
      {(props) => (
        <p>
          <GameListing
            gameBoard={props.gameBoard}
            users={props.users}
            gameDisplayNumber={props.gameDisplayNumber}
            gameMode={props.gameMode}
            gameStatus={props.gameStatus}
            usersInRoom={
              new Set(
                props.users
                  .filter((user) => user !== null)
                  .filter((user, index) => index % 2 === 0),
              )
            }
          />
        </p>
      )}
    </For>
  );
}
