import { UserInputError } from '../error.js';
import { type Game } from '../game.js';
import { ActionBase } from './base.js';

export class ActionGameOver extends ActionBase {
  constructor(game: Game, playerId: number) {
    super(game, playerId);
  }

  prepare() {
    return null;
  }

  execute(): ActionBase[] {
    throw new UserInputError('cannot make any more moves');
  }
}
