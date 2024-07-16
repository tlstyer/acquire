import { PB_GameMode } from '../common/pb';
import { iterateProcessedGameData } from './misc';

async function main(processedGameDataFilePath: string) {
  const gameModeToPlacingsForGameMode = new Map<PB_GameMode, PlacingsForGameMode>();

  for await (const processedGameData of iterateProcessedGameData(processedGameDataFilePath)) {
    if (!gameModeToPlacingsForGameMode.has(processedGameData.gameMode)) {
      gameModeToPlacingsForGameMode.set(processedGameData.gameMode, new PlacingsForGameMode());
    }

    const placingsForGameMode = gameModeToPlacingsForGameMode.get(processedGameData.gameMode)!;

    placingsForGameMode.ingest(processedGameData.placings);
  }

  const gameModes = [...gameModeToPlacingsForGameMode.keys()].sort((a, b) => a - b);

  for (const gameMode of gameModes) {
    const placingsForGameMode = gameModeToPlacingsForGameMode.get(gameMode)!;

    console.log();

    console.log(PB_GameMode[gameMode], placingsForGameMode.numGames);

    for (let teamID = 0; teamID < placingsForGameMode.teamIDToNumPlacings.length; teamID++) {
      console.log(
        placingsForGameMode.teamIDToNumPlacings[teamID]
          .map((numTimes) => ((numTimes / placingsForGameMode.numGames) * 100).toFixed(2))
          .join(' '),
      );
    }
  }
}

class PlacingsForGameMode {
  numGames = 0;
  teamIDToNumPlacings: number[][] = [];

  ingest(placings: number[]) {
    if (this.teamIDToNumPlacings.length === 0) {
      for (let teamID = 0; teamID < placings.length; teamID++) {
        const row = new Array(placings.length);
        row.fill(0);
        this.teamIDToNumPlacings.push(row);
      }
    }

    this.numGames++;

    for (let teamID = 0; teamID < placings.length; teamID++) {
      const placing = placings[teamID];
      this.teamIDToNumPlacings[teamID][placing - 1]++;
    }
  }
}

main(process.argv[2]).catch((reason) => console.log(reason));
