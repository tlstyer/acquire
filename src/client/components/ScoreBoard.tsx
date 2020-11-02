import { List } from 'immutable';
import * as React from 'react';
import { ScoreBoardIndexEnum } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { PB_GameMode } from '../../common/pb';
import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, teamNumberToCSSClassName } from '../helpers';
import * as style from './ScoreBoard.scss';

export interface ScoreBoardProps {
  usernames: List<string>;
  scoreBoard: List<List<number>>;
  scoreBoardAvailable: List<number>;
  scoreBoardChainSize: List<number>;
  scoreBoardPrice: List<number>;
  safeChains: List<boolean>;
  turnPlayerID: number;
  movePlayerID: number;
  gameMode: PB_GameMode;
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
      safeChains,
      turnPlayerID,
      movePlayerID,
      gameMode,
      cellWidth,
    } = this.props;

    const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
    const numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;

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
      <table className={style.root} style={{ fontSize: Math.floor(cellWidth * 0.6), width: cellWidth * 18 + 2 }}>
        <tbody>
          <ScoreBoardHeader />
          {usernames.map((username, playerID) => (
            <ScoreBoardRow
              key={playerID}
              isPlayerRow={true}
              title={username}
              isPlayersTurn={playerID === turnPlayerID}
              isPlayersMove={playerID === movePlayerID}
              scoreBoardRow={scoreBoard.get(playerID)!}
              safeChains={safeChains}
              defaultClassName={isTeamGame ? teamNumberToCSSClassName.get((playerID % numTeams) + 1)! : style.player}
              zeroValueReplacement={''}
            />
          ))}
          <ScoreBoardRow
            isPlayerRow={false}
            title={'Available'}
            isPlayersTurn={false}
            isPlayersMove={false}
            scoreBoardRow={scoreBoardAvailable}
            safeChains={safeChains}
            defaultClassName={style.availableChainSizeAndPrice}
            zeroValueReplacement={'0'}
            teamNumber={teamNumbers[0]}
            teamTotal={teamTotals[0]}
          />
          <ScoreBoardRow
            isPlayerRow={false}
            title={'Chain Size'}
            isPlayersTurn={false}
            isPlayersMove={false}
            scoreBoardRow={scoreBoardChainSize}
            safeChains={safeChains}
            defaultClassName={style.availableChainSizeAndPrice}
            zeroValueReplacement={'-'}
            teamNumber={teamNumbers[1]}
            teamTotal={teamTotals[1]}
          />
          <ScoreBoardRow
            isPlayerRow={false}
            title={'Price ($00)'}
            isPlayersTurn={false}
            isPlayersMove={false}
            scoreBoardRow={scoreBoardPrice}
            safeChains={safeChains}
            defaultClassName={style.availableChainSizeAndPrice}
            zeroValueReplacement={'-'}
            teamNumber={teamNumbers[2]}
            teamTotal={teamTotals[2]}
          />
        </tbody>
      </table>
    );
  }
}

function getTeamTotal(scoreBoard: List<List<number>>, numTeams: number, teamNumber: number) {
  let teamTotal = 0;
  for (let playerID = teamNumber - 1; playerID < scoreBoard.size; playerID += numTeams) {
    teamTotal += scoreBoard.get(playerID)!.get(ScoreBoardIndexEnum.Net)!;
  }
  return teamTotal;
}

class ScoreBoardHeader extends React.PureComponent {
  render() {
    return (
      <tr>
        <td className={style.playerHeader}>Player</td>
        {allChains.map((chain) => (
          <td key={chain} className={gameBoardTypeToCSSClassName.get(chain)}>
            {gameBoardTypeToHotelInitial.get(chain)}
          </td>
        ))}
        <td className={style.cashAndNetHeader}>Cash</td>
        <td className={style.cashAndNetHeader}>Net</td>
      </tr>
    );
  }
}

interface ScoreBoardRowProps {
  isPlayerRow: boolean;
  title: string;
  isPlayersTurn: boolean;
  isPlayersMove: boolean;
  scoreBoardRow: List<number>;
  safeChains: List<boolean>;
  defaultClassName: string;
  zeroValueReplacement: string;
  teamNumber?: number;
  teamTotal?: number;
}

class ScoreBoardRow extends React.PureComponent<ScoreBoardRowProps> {
  render() {
    const {
      isPlayerRow,
      title,
      isPlayersTurn,
      isPlayersMove,
      scoreBoardRow,
      safeChains,
      defaultClassName,
      zeroValueReplacement,
      teamNumber,
      teamTotal,
    } = this.props;

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
        <td className={nameCellClassName} title={isPlayerRow ? title : undefined}>
          {title}
        </td>
        {safeChains.map((isSafe, chain) => {
          const value = scoreBoardRow.get(chain)!;
          return (
            <td key={chain} className={isSafe ? style.safeChain : defaultClassName}>
              {value === 0 ? zeroValueReplacement : value}
            </td>
          );
        })}
        {scoreBoardRow.size === ScoreBoardIndexEnum.Max ? (
          <td className={defaultClassName}>{scoreBoardRow.get(ScoreBoardIndexEnum.Cash)! * 100}</td>
        ) : (
          <td className={style.bottomRightCells}>{teamNumber !== undefined ? `Team ${teamNumber}` : undefined}</td>
        )}
        {scoreBoardRow.size === ScoreBoardIndexEnum.Max ? (
          <td className={defaultClassName}>{scoreBoardRow.get(ScoreBoardIndexEnum.Net)! * 100}</td>
        ) : (
          <td className={teamNumber !== undefined ? teamNumberToCSSClassName.get(teamNumber) : style.bottomRightCells}>
            {teamTotal !== undefined ? teamTotal * 100 : undefined}
          </td>
        )}
      </tr>
    );
  }
}
