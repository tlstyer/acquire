import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';
import { Game } from './game';
import { gameFromJSON, gameToJSON } from './gameSerialization';
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
          const playerId = game.userIds.indexOf(game.myUserId ?? -1);
          const game2 = new Game(
            game.gameMode,
            game.playerArrangementMode,
            [],
            game.userIds,
            game.usernames,
            game.hostUserId,
            game.myUserId,
          );

          game.gameStateHistory.forEach((gameState) => {
            gameState.createPlayerAndWatcherGameStates();
            const gameMessage =
              playerId !== -1 ? gameState.playerGameStates[playerId] : gameState.watcherGameState;
            game2.processGameState(gameMessage);

            const gameState2 = game2.gameStateHistory[game2.gameStateHistory.length - 1];
            if (gameState2 !== null) {
              gameState2.createPlayerAndWatcherGameStates();
              const gameMessage2 =
                playerId !== -1
                  ? gameState2.playerGameStates[playerId]
                  : gameState2.watcherGameState;
              expect(gameMessage2).toEqual(gameMessage);
            } else {
              expect(false).toBe(true);
            }
          });

          expect(gameToJSON(game2)).toEqual(gameToJSON(game));
        } else {
          const json = gameToJSON(game);
          const game2 = gameFromJSON(json);
          const json2 = gameToJSON(game2);
          expect(json2).toEqual(json);
        }
      });
    }
  }
}

processDirectory(__dirname, 'gameTestFiles');
