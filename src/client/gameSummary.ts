import { PB_GameBoardType, PB_GameMode, PB_GameStatus, PB_PlayerArrangementMode } from '../common/pb';

export class GameSummary {
  constructor(
    public gameMode: PB_GameMode,
    public playerArrangementMode: PB_PlayerArrangementMode,
    public gameStatus: PB_GameStatus,
    public userIDs: number[],
    public usernames: string[],
    public hostUserID: number,
    public gameBoard: PB_GameBoardType[][],
  ) {}

  setGameBoardPosition(tile: number, gameBoardType: PB_GameBoardType) {
    const y = tile % 9;
    const x = (tile - y) / 9;

    this.gameBoard = [...this.gameBoard];
    this.gameBoard[y] = [...this.gameBoard[y]];
    this.gameBoard[y][x] = gameBoardType;
  }
}
