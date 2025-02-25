import { type Game } from '../game.js';
import { type PB_GameAction } from '../pb.js';

export abstract class ActionBase {
  constructor(
    public game: Game,
    public playerId: number,
  ) {}

  abstract prepare(): ActionBase[] | null;

  abstract execute(gameAction: PB_GameAction): ActionBase[];
}
