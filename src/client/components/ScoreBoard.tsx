import { List } from 'immutable';
import * as React from 'react';

import { defaultScoreBoardRow } from '../../common/defaults';
import { GameMode, ScoreBoardIndex } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { chains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, teamNumberToCSSClassName } from '../helpers';
import * as style from './ScoreBoard.css';

export interface ScoreBoardProps {
    usernames: string[];
    scoreBoard: List<List<number>>;
    scoreBoardAvailable: List<number>;
    scoreBoardChainSize: List<number>;
    scoreBoardPrice: List<number>;
    turnPlayerID: number;
    movePlayerID: number;
    gameMode: GameMode;
    cellWidth: number;
}

export class ScoreBoard extends React.PureComponent<ScoreBoardProps> {
    render() {
        const {
            usernames,
            scoreBoard,
            scoreBoardAvailable,
            scoreBoardChainSize,
            scoreBoardPrice,
            turnPlayerID,
            movePlayerID,
            gameMode,
            cellWidth,
        } = this.props;

        const cellHeight = Math.ceil(cellWidth * 0.75);

        const isTeamGame = gameModeToTeamSize[gameMode] > 1;
        const numTeams = gameModeToNumPlayers[gameMode] / gameModeToTeamSize[gameMode];

        const teamNumbers: (number | undefined)[] = new Array(3);
        const teamTotals: (number | undefined)[] = new Array(3);
        if (isTeamGame) {
            if (numTeams === 2) {
                teamNumbers[1] = 1;
                teamNumbers[2] = 2;
                teamTotals[1] = getTeamTotal(scoreBoard, numTeams, 1);
                teamTotals[2] = getTeamTotal(scoreBoard, numTeams, 2);
            } else {
                teamNumbers[0] = 1;
                teamNumbers[1] = 2;
                teamNumbers[2] = 3;
                teamTotals[0] = getTeamTotal(scoreBoard, numTeams, 1);
                teamTotals[1] = getTeamTotal(scoreBoard, numTeams, 2);
                teamTotals[2] = getTeamTotal(scoreBoard, numTeams, 3);
            }
        }

        return (
            <table className={style.root} style={{ fontSize: Math.floor(cellWidth * 0.6) }}>
                <tbody>
                    <ScoreBoardHeader cellWidth={cellWidth} cellHeight={cellHeight} />
                    {usernames.map((username, playerID) => (
                        <ScoreBoardRow
                            key={playerID}
                            title={username}
                            isPlayersTurn={playerID === turnPlayerID}
                            isPlayersMove={playerID === movePlayerID}
                            scoreBoardRow={scoreBoard.get(playerID, defaultScoreBoardRow)}
                            scoreBoardChainSize={scoreBoardChainSize}
                            defaultClassName={isTeamGame ? teamNumberToCSSClassName[playerID % numTeams + 1] : style.player}
                            zeroValueReplacement={''}
                            cellWidth={cellWidth}
                            cellHeight={cellHeight}
                        />
                    ))}
                    <ScoreBoardRow
                        title={'Available'}
                        isPlayersTurn={false}
                        isPlayersMove={false}
                        scoreBoardRow={scoreBoardAvailable}
                        scoreBoardChainSize={scoreBoardChainSize}
                        defaultClassName={style.availableChainSizeAndPrice}
                        zeroValueReplacement={'0'}
                        teamNumber={teamNumbers[0]}
                        teamTotal={teamTotals[0]}
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                    />
                    <ScoreBoardRow
                        title={'Chain Size'}
                        isPlayersTurn={false}
                        isPlayersMove={false}
                        scoreBoardRow={scoreBoardChainSize}
                        scoreBoardChainSize={scoreBoardChainSize}
                        defaultClassName={style.availableChainSizeAndPrice}
                        zeroValueReplacement={'-'}
                        teamNumber={teamNumbers[1]}
                        teamTotal={teamTotals[1]}
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                    />
                    <ScoreBoardRow
                        title={'Price ($00)'}
                        isPlayersTurn={false}
                        isPlayersMove={false}
                        scoreBoardRow={scoreBoardPrice}
                        scoreBoardChainSize={scoreBoardChainSize}
                        defaultClassName={style.availableChainSizeAndPrice}
                        zeroValueReplacement={'-'}
                        teamNumber={teamNumbers[2]}
                        teamTotal={teamTotals[2]}
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                    />
                </tbody>
            </table>
        );
    }
}

function getTeamTotal(scoreBoard: List<List<number>>, numTeams: number, teamNumber: number) {
    let teamTotal = 0;
    for (let playerID = teamNumber - 1; playerID < scoreBoard.size; playerID += numTeams) {
        teamTotal += scoreBoard.get(playerID, defaultScoreBoardRow).get(ScoreBoardIndex.Net, 0);
    }
    return teamTotal;
}

interface ScoreBoardHeaderProps {
    cellWidth: number;
    cellHeight: number;
}

class ScoreBoardHeader extends React.PureComponent<ScoreBoardHeaderProps> {
    render() {
        const { cellWidth, cellHeight } = this.props;

        const playerStyle = { width: cellWidth * 5, maxWidth: cellWidth * 5, height: cellHeight, maxHeight: cellHeight };
        const chainStyle = { width: cellWidth, maxWidth: cellWidth, height: cellHeight, maxHeight: cellHeight };
        const cashAndNetStyle = { width: cellWidth * 3, maxWidth: cellWidth * 3, height: cellHeight, maxHeight: cellHeight };

        return (
            <tr>
                <td className={style.playerHeader} style={playerStyle}>
                    Player
                </td>
                {chains.map(chain => (
                    <td key={chain} className={gameBoardTypeToCSSClassName[chain]} style={chainStyle}>
                        {gameBoardTypeToHotelInitial[chain]}
                    </td>
                ))}
                <td className={style.cashAndNetHeader} style={cashAndNetStyle}>
                    Cash
                </td>
                <td className={style.cashAndNetHeader} style={cashAndNetStyle}>
                    Net
                </td>
            </tr>
        );
    }
}

interface ScoreBoardRowProps {
    title: string;
    isPlayersTurn: boolean;
    isPlayersMove: boolean;
    scoreBoardRow: List<number>;
    scoreBoardChainSize: List<number>;
    defaultClassName: string;
    zeroValueReplacement: string;
    teamNumber?: number;
    teamTotal?: number;
    cellWidth: number;
    cellHeight: number;
}

class ScoreBoardRow extends React.PureComponent<ScoreBoardRowProps> {
    render() {
        const {
            title,
            isPlayersTurn,
            isPlayersMove,
            scoreBoardRow,
            scoreBoardChainSize,
            defaultClassName,
            zeroValueReplacement,
            teamNumber,
            teamTotal,
            cellWidth,
            cellHeight,
        } = this.props;

        const playerStyle = { width: cellWidth * 5, maxWidth: cellWidth * 5, height: cellHeight, maxHeight: cellHeight };
        const chainStyle = { width: cellWidth, maxWidth: cellWidth, height: cellHeight, maxHeight: cellHeight };
        const cashAndNetStyle = { width: cellWidth * 3, maxWidth: cellWidth * 3, height: cellHeight, maxHeight: cellHeight };

        let nameCellClassName: string;
        if (isPlayersTurn) {
            nameCellClassName = style.isPlayersTurn;
        } else if (isPlayersMove) {
            nameCellClassName = style.isPlayersMove;
        } else {
            nameCellClassName = defaultClassName;
        }

        return (
            <tr>
                <td className={nameCellClassName} style={playerStyle}>
                    {title}
                </td>
                {scoreBoardChainSize.map((size, chain) => {
                    const value = scoreBoardRow.get(chain, 0);
                    return (
                        <td key={chain} className={scoreBoardChainSize.get(chain, 0) >= 11 ? style.safeChain : defaultClassName} style={chainStyle}>
                            {value === 0 ? zeroValueReplacement : value}
                        </td>
                    );
                })}
                {scoreBoardRow.size === ScoreBoardIndex.Max ? (
                    <td className={defaultClassName} style={cashAndNetStyle}>
                        {scoreBoardRow.get(7, 0) * 100}
                    </td>
                ) : (
                    <td className={style.bottomRightCells} style={cashAndNetStyle}>
                        {teamNumber !== undefined ? 'Team ' + teamNumber : undefined}
                    </td>
                )}
                {scoreBoardRow.size === ScoreBoardIndex.Max ? (
                    <td className={defaultClassName} style={cashAndNetStyle}>
                        {scoreBoardRow.get(8, 0) * 100}
                    </td>
                ) : (
                    <td className={teamNumber !== undefined ? teamNumberToCSSClassName[teamNumber] : style.bottomRightCells} style={cashAndNetStyle}>
                        {teamTotal !== undefined ? teamTotal * 100 : undefined}
                    </td>
                )}
            </tr>
        );
    }
}
