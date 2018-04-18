import { List } from 'immutable';
import * as React from 'react';

import { defaultScoreBoardRow } from '../../common/defaults';
import { ScoreBoardIndex } from '../../common/enums';
import { chains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';
import * as style from './ScoreBoard.css';

export interface ScoreBoardProps {
    usernames: string[];
    scoreBoard: List<List<number>>;
    scoreBoardAvailable: List<number>;
    scoreBoardChainSize: List<number>;
    scoreBoardPrice: List<number>;
    turnPlayerID: number;
    movePlayerID: number;
    isTeamGame: boolean;
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
            isTeamGame,
            cellWidth,
        } = this.props;

        const cellHeight = Math.ceil(cellWidth * 0.75);

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
                            defaultClassName={style.player}
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
                        teamHeader={isTeamGame ? 'Team 1' : ''}
                        teamTotal={
                            isTeamGame
                                ? scoreBoard.get(0, defaultScoreBoardRow).get(ScoreBoardIndex.Net, 0) +
                                  scoreBoard.get(2, defaultScoreBoardRow).get(ScoreBoardIndex.Net, 0)
                                : undefined
                        }
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
                        teamHeader={isTeamGame ? 'Team 2' : ''}
                        teamTotal={
                            isTeamGame
                                ? scoreBoard.get(1, defaultScoreBoardRow).get(ScoreBoardIndex.Net, 0) +
                                  scoreBoard.get(3, defaultScoreBoardRow).get(ScoreBoardIndex.Net, 0)
                                : undefined
                        }
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                    />
                </tbody>
            </table>
        );
    }
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
    teamHeader?: string;
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
            teamHeader,
            teamTotal,
            cellWidth,
            cellHeight,
        } = this.props;

        const playerStyle = { width: cellWidth * 5, maxWidth: cellWidth * 5, height: cellHeight, maxHeight: cellHeight };
        const chainStyle = { width: cellWidth, maxWidth: cellWidth, height: cellHeight, maxHeight: cellHeight };
        const cashAndNetStyle = { width: cellWidth * 3, maxWidth: cellWidth * 3, height: cellHeight, maxHeight: cellHeight };

        let nameCellClassName: string | undefined;
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
                        {teamHeader}
                    </td>
                )}
                {scoreBoardRow.size === ScoreBoardIndex.Max ? (
                    <td className={defaultClassName} style={cashAndNetStyle}>
                        {scoreBoardRow.get(8, 0) * 100}
                    </td>
                ) : (
                    <td className={teamTotal !== undefined ? style.teamTotal : style.bottomRightCells} style={cashAndNetStyle}>
                        {teamTotal !== undefined ? teamTotal * 100 : ''}
                    </td>
                )}
            </tr>
        );
    }
}
