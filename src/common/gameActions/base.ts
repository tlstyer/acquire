import type { GameActionEnum } from '../enums.js';
import type { Game } from '../game.js';
import type { PB_GameAction } from '../pb.js';

export abstract class ActionBase {
  constructor(
    public game: Game,
    public playerId: number,
    public gameAction: GameActionEnum,
  ) {}

  abstract prepare(): ActionBase[] | null;

  abstract execute(gameAction: PB_GameAction): ActionBase[];
}
