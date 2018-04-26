import * as React from 'react';

import { GameMode, PlayerArrangementMode } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import * as style from './GameSetup.css';

export interface GameSetupProps {
    gameMode: GameMode;
    playerArrangementMode: PlayerArrangementMode;
    userIDs: (number | null)[];
    usernames: (string | null)[];
    onChangeGameMode?: (gameMode: GameMode) => void;
    onChangePlayerArrangementMode?: (playerArrangementMode: PlayerArrangementMode) => void;
    onSwapPositions?: (position1: number, position2: number) => void;
}

interface GameSetupState {}

export class GameSetup extends React.PureComponent<GameSetupProps, GameSetupState> {
    render() {
        const { gameMode, playerArrangementMode, userIDs, onChangeGameMode, onChangePlayerArrangementMode } = this.props;

        let numUsersInGame = 0;
        for (let i = 0; i < userIDs.length; i++) {
            const userID = userIDs[i];
            if (userID !== null) {
                numUsersInGame++;
            }
        }

        const isTeamGame = gameModeToTeamSize[gameMode] > 1;

        return (
            <div>
                Game mode:{' '}
                {onChangeGameMode !== undefined ? (
                    <select
                        defaultValue={gameMode.toString()}
                        onChange={(event: React.FormEvent<HTMLSelectElement>) => onChangeGameMode(parseInt(event.currentTarget.value, 10))}
                    >
                        {allGameModes.map(gm => (
                            <option key={gm} value={gm} disabled={gameModeToNumPlayers[gm] < numUsersInGame}>
                                {gameModeToString[gm]}
                            </option>
                        ))}
                    </select>
                ) : (
                    gameModeToString[gameMode]
                )}
                <br />
                Player arrangement mode:{' '}
                {onChangePlayerArrangementMode !== undefined ? (
                    <select
                        defaultValue={playerArrangementMode.toString()}
                        onChange={(event: React.FormEvent<HTMLSelectElement>) => onChangePlayerArrangementMode(parseInt(event.currentTarget.value, 10))}
                    >
                        {allPlayerArrangementModes.map(
                            pam =>
                                pam !== PlayerArrangementMode.SpecifyTeams || isTeamGame ? (
                                    <option key={pam} value={pam}>
                                        {playerArrangementModeToString[pam]}
                                    </option>
                                ) : (
                                    undefined
                                ),
                        )}
                    </select>
                ) : (
                    playerArrangementModeToString[playerArrangementMode]
                )}
                <br />
                {playerArrangementMode === PlayerArrangementMode.RandomOrder
                    ? this.renderRandomOrder()
                    : playerArrangementMode === PlayerArrangementMode.SpecifyTeams
                        ? this.renderSpecifyTeams()
                        : this.renderSpecifyOrder()}
            </div>
        );
    }

    renderRandomOrder() {
        const { usernames } = this.props;

        return (
            <table className={style.table}>
                <tbody>
                    {usernames.map((username, i) => (
                        <tr key={i}>
                            <td className={style.user}>{username}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    renderSpecifyTeams() {
        return <div>Todo!</div>;
    }

    renderSpecifyOrder() {
        const { usernames, onSwapPositions } = this.props;

        const lastIndex = usernames.length - 1;

        return (
            <table className={style.table}>
                <tbody>
                    {usernames.map((username, i) => (
                        <tr key={i}>
                            <td className={style.user}>{username}</td>
                            {onSwapPositions !== undefined ? (
                                <td>{i > 0 ? <input type={'button'} value={'▲'} onClick={() => onSwapPositions(i, i - 1)} /> : undefined}</td>
                            ) : (
                                undefined
                            )}
                            {onSwapPositions !== undefined ? (
                                <td>{i < lastIndex ? <input type={'button'} value={'▼'} onClick={() => onSwapPositions(i, i + 1)} /> : undefined}</td>
                            ) : (
                                undefined
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

const gameModeToString: { [key: number]: string } = {
    [GameMode.Singles1]: 'Singles 1',
    [GameMode.Singles2]: 'Singles 2',
    [GameMode.Singles3]: 'Singles 3',
    [GameMode.Singles4]: 'Singles 4',
    [GameMode.Singles5]: 'Singles 5',
    [GameMode.Singles6]: 'Singles 6',
    [GameMode.Teams2vs2]: 'Teams 2 vs 2',
    [GameMode.Teams2vs2vs2]: 'Teams 2 vs 2 vs 2',
    [GameMode.Teams3vs3]: 'Teams 3 vs 3',
};

const playerArrangementModeToString: { [key: number]: string } = {
    [PlayerArrangementMode.RandomOrder]: 'Random Order',
    [PlayerArrangementMode.SpecifyTeams]: 'Specify Teams',
    [PlayerArrangementMode.SpecifyOrder]: 'Specify Order',
};

const allGameModes: GameMode[] = [
    GameMode.Singles1,
    GameMode.Singles2,
    GameMode.Singles3,
    GameMode.Singles4,
    GameMode.Singles5,
    GameMode.Singles6,
    GameMode.Teams2vs2,
    GameMode.Teams2vs2vs2,
    GameMode.Teams3vs3,
];

const allPlayerArrangementModes: PlayerArrangementMode[] = [
    PlayerArrangementMode.RandomOrder,
    PlayerArrangementMode.SpecifyTeams,
    PlayerArrangementMode.SpecifyOrder,
];
