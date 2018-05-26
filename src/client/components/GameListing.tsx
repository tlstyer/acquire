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
    usernames: List<string | null>;
    gameDisplayNumber: number;
    gameMode: GameMode;
    gameStatus: GameStatus;
    onJoinClicked?: () => void;
    onRejoinClicked?: () => void;
    onWatchClicked?: () => void;
}

export class GameListing extends React.PureComponent<GameListingProps> {
    render() {
        const { gameBoard, usernames, gameDisplayNumber, gameMode, gameStatus, onJoinClicked, onRejoinClicked, onWatchClicked } = this.props;

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
                    <div>Game #{gameDisplayNumber}</div>
                    <div>{gameModeToString[gameMode]}</div>
                    <div>{gameStatusToString[gameStatus]}</div>
                    {onJoinClicked ? (
                        <div>
                            <input type={'button'} value={'Join'} onClick={onJoinClicked} />
                        </div>
                    ) : (
                        undefined
                    )}
                    {onRejoinClicked ? (
                        <div>
                            <input type={'button'} value={'Rejoin'} onClick={onRejoinClicked} />
                        </div>
                    ) : (
                        undefined
                    )}
                    {onWatchClicked ? (
                        <div>
                            <input type={'button'} value={'Watch'} onClick={onWatchClicked} />
                        </div>
                    ) : (
                        undefined
                    )}
                </div>
            </div>
        );
    }
}
