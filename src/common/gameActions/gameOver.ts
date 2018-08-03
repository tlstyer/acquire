import { GameAction } from '../enums';
import { UserInputError } from '../error';
import { Game } from '../game';
import { ActionBase } from './base';

export class ActionGameOver extends ActionBase {
  constructor(game: Game, playerID: number) {
    super(game, playerID, GameAction.GameOver);
  }

  prepare() {
    return null;
  }

  execute(parameters: any[]): ActionBase[] {
    throw new UserInputError('cannot make any more moves');
  }
}
