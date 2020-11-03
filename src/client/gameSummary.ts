import { List } from 'immutable';
import { PB_GameBoardType, PB_GameMode, PB_GameStatus, PB_PlayerArrangementMode } from '../common/pb';

export class GameSummary {
  constructor(
    public gameMode: PB_GameMode,
    public playerArrangementMode: PB_PlayerArrangementMode,
    public gameStatus: PB_GameStatus,
    public userIDs: List<number>,
    public usernames: List<string>,
    public hostUserID: number,
    public gameBoard: List<List<PB_GameBoardType>>,
  ) {}

  setGameBoardPosition(tile: number, gameBoardType: PB_GameBoardType) {
    this.gameBoard = this.gameBoard.setIn([tile % 9, tile / 9], gameBoardType);
  }
}
