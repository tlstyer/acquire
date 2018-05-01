import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType, GameMode } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { GameStatus } from '../enums';
import { gameModeToString, gameStatusToString, teamNumberToCSSClassName } from '../helpers';
import * as style from './GameListing.css';
import { MiniGameBoard } from './MiniGameBoard';

export interface GameListingProps {
    gameBoard: List<GameBoardType>;
    gameMode: GameMode;
    usernames: List<string | null>;
    gameStatus: GameStatus;
}

export class GameListing extends React.PureComponent<GameListingProps> {
    render() {
        const { gameBoard, gameMode, usernames, gameStatus } = this.props;

        const isTeamGame = gameModeToTeamSize[gameMode] > 1;
        const numTeams = gameModeToNumPlayers[gameMode] / gameModeToTeamSize[gameMode];

        return (
            <div>
                <div className={style.miniGameBoardWrapper}>
                    <MiniGameBoard gameBoard={gameBoard} cellSize={15} />
                </div>
                <table className={style.players}>
                    <tbody>
                        {usernames.map((username, i) => (
                            <tr key={i}>
                                <td className={isTeamGame ? teamNumberToCSSClassName[i % numTeams + 1] : style.player}>{username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={style.other}>
                    {gameModeToString[gameMode]}
                    <br />
                    {gameStatusToString[gameStatus]}
                </div>
            </div>
        );
    }
}
