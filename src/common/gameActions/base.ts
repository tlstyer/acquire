import { GameActionEnum } from '../enums';
import { Game } from '../game';
import { PB } from '../pb';

export abstract class ActionBase {
  constructor(public game: Game, public playerID: number, public gameAction: GameActionEnum) {}

  abstract prepare(): ActionBase[] | null;

  abstract execute(gameAction: PB.IGameAction): ActionBase[];
}
