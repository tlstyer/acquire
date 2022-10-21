import fs from 'fs';
import path from 'path';
import { Game } from './game';
import { runGameTestFile } from './runGameTestFile';

const inputBasePath = `${__dirname}/gameTestFiles/`;
const outputBasePath = '';

function processDirectory(base: string, dir: string) {
  const dirPath = path.join(base, dir);
  const files = fs.readdirSync(dirPath);

  if (outputBasePath !== '') {
    const outputDirPath = path.join(outputBasePath, dirPath.slice(inputBasePath.length));
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath);
    }
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      describe(file, () => {
        processDirectory(dirPath, file);
      });
    } else if (stats.isFile()) {
      test(file.slice(0, -4), () => {
        const inputLines = fs.readFileSync(filePath).toString().split('\n');
        const result = runGameTestFile(inputLines);
        const outputLines = result.outputLines;
        const game = result.game!;

        if (outputBasePath !== '') {
          const outputFilePath = path.join(outputBasePath, filePath.slice(inputBasePath.length));
          fs.writeFileSync(outputFilePath, outputLines.join('\n'));
        }

        expect(outputLines).toEqual(inputLines);

        if (dir === "from a user's perspective") {
          const playerID = game.userIDs.indexOf(game.myUserID || -1);
          const game2 = new Game(game.gameMode, game.playerArrangementMode, [], game.userIDs, game.usernames, game.hostUserID, game.myUserID);

          game.gameStateHistory.forEach((gameState) => {
            gameState.createPlayerAndWatcherGameStates();
            const gameMessage = playerID !== -1 ? gameState.playerGameStates[playerID] : gameState.watcherGameState;
            game2.processGameState(gameMessage);

            const gameState2 = game2.gameStateHistory.get(game2.gameStateHistory.size - 1, null);
            if (gameState2 !== null) {
              gameState2.createPlayerAndWatcherGameStates();
              const gameMessage2 = playerID !== -1 ? gameState2.playerGameStates[playerID] : gameState2.watcherGameState;
              expect(gameMessage2).toEqual(gameMessage);
            } else {
              expect(false).toBe(true);
            }
          });

          expect(game2.toJSON()).toEqual(game.toJSON());
        } else {
          const json = game.toJSON();
          const game2 = Game.fromJSON(json);
          const json2 = game2.toJSON();
          expect(json2).toEqual(json);
        }
      });
    }
  }
}

processDirectory(__dirname, 'gameTestFiles');
