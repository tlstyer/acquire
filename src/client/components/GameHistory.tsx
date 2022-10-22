import React from 'react';
import { GameHistoryMessageEnum } from '../../common/enums';
import { GameHistoryMessageData, GameState } from '../../common/game';
import { PB_GameBoardType } from '../../common/pb';
import { getHotelNameSpan, getTileString, getUsernameSpan } from '../helpers';
import * as style from './GameHistory.scss';

export interface GameHistoryProps {
  usernames: string[];
  gameStateHistory: GameState[];
  selectedMove?: number;
  onMoveClicked: (index: number) => void;
}

export class GameHistory extends React.PureComponent<GameHistoryProps> {
  parentRef: React.RefObject<HTMLDivElement>;
  selectedMoveRef: React.RefObject<HTMLDivElement>;

  constructor(props: GameHistoryProps) {
    super(props);

    this.parentRef = React.createRef();
    this.selectedMoveRef = React.createRef();
  }

  componentDidMount() {
    setTimeout(this.autoScroll, 0);
  }

  componentDidUpdate() {
    setTimeout(this.autoScroll, 0);
  }

  autoScroll = () => {
    const parent = this.parentRef.current;
    const selectedMove = this.selectedMoveRef.current;

    if (parent !== null && selectedMove !== null) {
      const parentScrollTop = parent.scrollTop;
      const parentScrollBottom = parentScrollTop + parent.clientHeight;

      const selectedMoveRelativeOffsetTop = selectedMove.offsetTop - parent.offsetTop;
      const selectedMoveRelativeOffsetBottom = selectedMoveRelativeOffsetTop + selectedMove.clientHeight;

      if (selectedMoveRelativeOffsetTop < parentScrollTop || selectedMove.clientHeight > parent.clientHeight) {
        parent.scrollTop = selectedMoveRelativeOffsetTop;
      } else if (selectedMoveRelativeOffsetBottom > parentScrollBottom) {
        parent.scrollTop = selectedMoveRelativeOffsetBottom - parent.clientHeight;
      }
    }
  };

  render() {
    const { usernames, gameStateHistory, selectedMove, onMoveClicked } = this.props;

    return (
      <div className={style.root} ref={this.parentRef}>
        {gameStateHistory.map((gameState, i) => {
          const optionalProps: { [key: string]: any } = {};
          if (i === selectedMove) {
            optionalProps.ref = this.selectedMoveRef;
          }

          return (
            <div key={i} {...optionalProps}>
              <MoveHistory usernames={usernames} gameState={gameState} moveIndex={i} isSelected={i === selectedMove} onMoveClicked={onMoveClicked} />
            </div>
          );
        })}
      </div>
    );
  }
}

interface MoveHistoryProps {
  usernames: string[];
  gameState: GameState;
  moveIndex: number;
  isSelected: boolean;
  onMoveClicked: (index: number) => void;
}

const MoveHistory = React.memo(function MoveHistory({ usernames, gameState, moveIndex, isSelected, onMoveClicked }: MoveHistoryProps) {
  const optionalProps: { [key: string]: any } = {};
  if (gameState.timestamp !== null) {
    const date = new Date(gameState.timestamp);
    optionalProps.title = date.toString();
  }

  return (
    <div className={style.move + (isSelected ? ` ${style.selected}` : '')} {...optionalProps} onClick={() => onMoveClicked(moveIndex)}>
      {gameState.gameHistoryMessages.map((ghmd, index) => {
        const username = ghmd.playerID === null ? '' : usernames[ghmd.playerID];
        return gameHistoryMessageHandlerLookup.get(ghmd.gameHistoryMessage)!(index, username, ghmd);
      })}
    </div>
  );
});

const gameHistoryMessageHandlerLookup = new Map<GameHistoryMessageEnum, (key: number, username: string, ghmd: GameHistoryMessageData) => JSX.Element>([
  [
    GameHistoryMessageEnum.TurnBegan,
    (key, username) => (
      <div key={key}>
        <fieldset className={style.turnBegan}>
          <legend>{getUsernameSpan(username)}</legend>
        </fieldset>
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.DrewPositionTile,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} drew position tile {getTileString(ghmd.parameters[0])}.
      </div>
    ),
  ],
  [GameHistoryMessageEnum.StartedGame, (key, username) => <div key={key}>{getUsernameSpan(username)} started the game.</div>],
  [
    GameHistoryMessageEnum.DrewTile,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} drew tile {getTileString(ghmd.parameters[0])}.
      </div>
    ),
  ],
  [GameHistoryMessageEnum.HasNoPlayableTile, (key, username) => <div key={key}>{getUsernameSpan(username)} has no playable tile.</div>],
  [
    GameHistoryMessageEnum.PlayedTile,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} played tile {getTileString(ghmd.parameters[0])}.
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.FormedChain,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} formed {getHotelNameSpan(ghmd.parameters[0])}.
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.MergedChains,
    (key, username, ghmd) => {
      const chains: number[] = ghmd.parameters[0];
      if (chains.length === 2) {
        return (
          <div key={key}>
            {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])} and {getHotelNameSpan(chains[1])}.
          </div>
        );
      } else if (chains.length === 3) {
        return (
          <div key={key}>
            {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])}, {getHotelNameSpan(chains[1])}, and {getHotelNameSpan(chains[2])}.
          </div>
        );
      } else {
        return (
          <div key={key}>
            {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])}, {getHotelNameSpan(chains[1])}, {getHotelNameSpan(chains[2])}, and{' '}
            {getHotelNameSpan(chains[3])}.
          </div>
        );
      }
    },
  ],
  [
    GameHistoryMessageEnum.SelectedMergerSurvivor,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} selected {getHotelNameSpan(ghmd.parameters[0])} as merger survivor.
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.SelectedChainToDisposeOfNext,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} selected {getHotelNameSpan(ghmd.parameters[0])} as chain to dispose of next.
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.ReceivedBonus,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} received a ${ghmd.parameters[1] * 100} {getHotelNameSpan(ghmd.parameters[0])} bonus.
      </div>
    ),
  ],
  [
    GameHistoryMessageEnum.DisposedOfShares,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} traded {ghmd.parameters[1]} and sold {ghmd.parameters[2]} {getHotelNameSpan(ghmd.parameters[0])} shares.
      </div>
    ),
  ],
  [GameHistoryMessageEnum.CouldNotAffordAnyShares, (key, username) => <div key={key}>{getUsernameSpan(username)} could not afford any shares.</div>],
  [
    GameHistoryMessageEnum.PurchasedShares,
    (key, username, ghmd) => {
      const chainsAndCounts: [PB_GameBoardType, number][] = ghmd.parameters[0];
      if (chainsAndCounts.length === 0) {
        return <div key={key}>{getUsernameSpan(username)} purchased nothing.</div>;
      } else if (chainsAndCounts.length === 1) {
        return (
          <div key={key}>
            {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])}.
          </div>
        );
      } else if (chainsAndCounts.length === 2) {
        return (
          <div key={key}>
            {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])} and {chainsAndCounts[1][1]}{' '}
            {getHotelNameSpan(chainsAndCounts[1][0])}.
          </div>
        );
      } else {
        return (
          <div key={key}>
            {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])}, {chainsAndCounts[1][1]}{' '}
            {getHotelNameSpan(chainsAndCounts[1][0])}, and {chainsAndCounts[2][1]} {getHotelNameSpan(chainsAndCounts[2][0])}.
          </div>
        );
      }
    },
  ],
  [GameHistoryMessageEnum.DrewLastTile, (key, username) => <div key={key}>{getUsernameSpan(username)} drew the last tile from the tile bag.</div>],
  [
    GameHistoryMessageEnum.ReplacedDeadTile,
    (key, username, ghmd) => (
      <div key={key}>
        {getUsernameSpan(username)} replaced dead tile {getTileString(ghmd.parameters[0])}.
      </div>
    ),
  ],
  [GameHistoryMessageEnum.EndedGame, (key, username) => <div key={key}>{getUsernameSpan(username)} ended the game.</div>],
  [GameHistoryMessageEnum.NoTilesPlayedForEntireRound, (key) => <div key={key}>No tiles played for an entire round. Game end forced.</div>],
  [GameHistoryMessageEnum.AllTilesPlayed, (key) => <div key={key}>All tiles have been played. Game end forced.</div>],
]);
