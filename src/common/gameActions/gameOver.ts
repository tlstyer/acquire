import { GameActionEnum } from '../enums';
import { UserInputError } from '../error';
import type { Game } from '../game';
import { ActionBase } from './base';

export class ActionGameOver extends ActionBase {
  constructor(game: Game, playerID: number) {
    super(game, playerID, GameActionEnum.GameOver);
  }

  prepare() {
    return null;
  }

  execute(): ActionBase[] {
    throw new UserInputError('cannot make any more moves');
  }
}
