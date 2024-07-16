import type { GameActionEnum } from '../enums';
import type { Game } from '../game';
import type { PB_GameAction } from '../pb';

export abstract class ActionBase {
  constructor(
    public game: Game,
    public playerID: number,
    public gameAction: GameActionEnum,
  ) {}

  abstract prepare(): ActionBase[] | null;

  abstract execute(gameAction: PB_GameAction): ActionBase[];
}
