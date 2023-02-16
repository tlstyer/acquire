import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import type { Game } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { gameFromJSON } from '../common/gameSerialization';
import { GameBoard } from './components/GameBoard';
import { GameHistory } from './components/GameHistory';
import { GameStatus } from './components/GameStatus';
import { ScoreBoard } from './components/ScoreBoard';
import { TileRackReadOnly } from './components/TileRackReadOnly';
import { GameBoardLabelMode } from './enums';
import './global.scss';
import * as style from './review.scss';

function render() {
  const gameState = game.gameStateHistory[selectedMove];

  let turnPlayerID = gameState.turnPlayerID;
  let movePlayerID = gameState.nextGameAction.playerID;
  if (gameState.nextGameAction instanceof ActionGameOver) {
    turnPlayerID = -1;
    movePlayerID = -1;
  }

  let gameBoardTileRack: (number | null)[] | undefined;
  if (game.userIDs.length > 1) {
    if (followedPlayerID !== null) {
      gameBoardTileRack = gameState.tileRacks[followedPlayerID];
    } else if (movePlayerID !== -1) {
      gameBoardTileRack = gameState.tileRacks[movePlayerID];
    }
  } else {
    gameBoardTileRack = gameState.tileRacks[0];
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const gameBoardCellSizeBasedOnWindowWidth = windowWidth / 2 / 12;
  const gameBoardCellSizeBasedOnWindowHeight = (windowHeight - 129) / 9;
  const gameBoardCellSize = Math.floor(Math.min(gameBoardCellSizeBasedOnWindowWidth, gameBoardCellSizeBasedOnWindowHeight));
  const gameBoardWidth = gameBoardCellSize * 12 + 2;

  const rightSideWidth = windowWidth - gameBoardWidth - 2;
  const scoreBoardCellWidth = Math.floor(Math.min(rightSideWidth - 2, gameBoardWidth) / 18);

  ReactDOM.render(
    <div className={style.root}>
      <div style={{ width: gameBoardWidth }}>
        <GameBoard gameBoard={gameState.gameBoard} tileRack={gameBoardTileRack} labelMode={GameBoardLabelMode.Nothing} cellSize={gameBoardCellSize} />
      </div>
      <div className={style.rightSide}>
        <ScoreBoard
          usernames={game.usernames}
          scoreBoard={gameState.scoreBoard}
          scoreBoardAvailable={gameState.scoreBoardAvailable}
          scoreBoardChainSize={gameState.scoreBoardChainSize}
          scoreBoardPrice={gameState.scoreBoardPrice}
          safeChains={gameState.safeChains}
          turnPlayerID={turnPlayerID}
          movePlayerID={movePlayerID}
          gameMode={game.gameMode}
          cellWidth={scoreBoardCellWidth}
        />
        {game.userIDs.map((_, playerID) => {
          const tileRack = gameState.tileRacks[playerID];
          const tileRackTypes = gameState.tileRackTypes[playerID];
          return (
            <div key={playerID}>
              <div className={style.tileRackWrapper}>
                <TileRackReadOnly tiles={tileRack} types={tileRackTypes} buttonSize={gameBoardCellSize} />
              </div>
              {game.userIDs.length > 1 ? (
                <div className={style.buttonWrapper} style={{ height: gameBoardCellSize }}>
                  {playerID === followedPlayerID ? (
                    <input type={'button'} value={'Unlock'} onClick={unfollowPlayer} />
                  ) : (
                    <input type={'button'} value={'Lock'} onClick={followPlayer.bind(null, playerID)} />
                  )}
                </div>
              ) : undefined}
            </div>
          );
        })}
        <GameHistory usernames={game.usernames} gameStateHistory={game.gameStateHistory} selectedMove={selectedMove} onMoveClicked={onMoveClicked} />
        <GameStatus usernames={game.usernames} nextGameAction={gameState.nextGameAction} />
      </div>
    </div>,
    document.getElementById('root'),
  );
}

function onMoveClicked(index: number) {
  if (index !== selectedMove) {
    selectedMove = index;
    render();
  }
}

function followPlayer(playerID: number) {
  followedPlayerID = playerID;
  render();
}

function unfollowPlayer() {
  followedPlayerID = null;
  render();
}

window.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'ArrowLeft' || keyName === 'ArrowRight') {
    const previouslySelectedMove = selectedMove;

    if (keyName === 'ArrowLeft') {
      selectedMove--;
      if (selectedMove < 0) {
        selectedMove = 0;
      }
    } else {
      selectedMove++;
      const lastMove = game.gameStateHistory.length - 1;
      if (selectedMove > lastMove) {
        selectedMove = lastMove;
      }
    }

    if (selectedMove !== previouslySelectedMove) {
      render();
    }
  }
});

let lastPeriodicResizeCheckWidth = -1;
let lastPeriodicResizeCheckHeight = -1;
function periodicResizeCheck() {
  if (window.innerWidth !== lastPeriodicResizeCheckWidth || window.innerHeight !== lastPeriodicResizeCheckHeight) {
    lastPeriodicResizeCheckWidth = window.innerWidth;
    lastPeriodicResizeCheckHeight = window.innerHeight;
    render();
  }

  setTimeout(periodicResizeCheck, 500);
}

let game: Game;
let selectedMove: number;
let followedPlayerID: number | null = null;

function main() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gameJson = require('raw-loader!../common/gameTestFiles/other/no tiles played for entire round.txt').default.split('\nGame JSON:\n')[1];

  game = gameFromJSON(JSON.parse(gameJson));
  selectedMove = game.gameStateHistory.length - 1;
  periodicResizeCheck();
}

main();
