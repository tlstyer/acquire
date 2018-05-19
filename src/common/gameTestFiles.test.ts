import * as fs from 'fs';
import * as path from 'path';
import { Game } from './game';
import { runGameTestFile } from './runGameTestFile';

const inputBasePath = `${__dirname}/gameTestFiles/`;
const outputBasePath = '';

function processDirectory(base: string, dir: string) {
    describe(base === __dirname ? 'game test files' : dir, () => {
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
                processDirectory(dirPath, file);
            } else if (stats.isFile()) {
                it(file, () => {
                    const inputLines = fs
                        .readFileSync(filePath)
                        .toString()
                        .split('\n');
                    const { outputLines, game } = runGameTestFile(inputLines);

                    if (outputBasePath !== '') {
                        const outputFilePath = path.join(outputBasePath, filePath.slice(inputBasePath.length));
                        fs.writeFileSync(outputFilePath, outputLines.join('\n'));
                    }

                    expect(outputLines).toEqual(inputLines);

                    if (game !== null) {
                        if (dir === "from a user's perspective") {
                            const playerID = game.userIDs.indexOf(game.myUserID || -1);
                            const game2 = new Game(game.gameMode, game.playerArrangementMode, [], game.userIDs, game.usernames, game.hostUserID, game.myUserID);

                            game.moveDataHistory.forEach(moveData => {
                                moveData.createPlayerAndWatcherMessages();
                                const gameMessage = playerID !== -1 ? moveData.playerMessages[playerID] : moveData.watcherMessage;
                                game2.processMoveDataMessage(gameMessage);

                                const moveData2 = game2.moveDataHistory.get(game2.moveDataHistory.size - 1, null);
                                if (moveData2 !== null) {
                                    moveData2.createPlayerAndWatcherMessages();
                                    const gameMessage2 = playerID !== -1 ? moveData2.playerMessages[playerID] : moveData2.watcherMessage;
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
                    }
                });
            }
        }
    });
}

processDirectory(__dirname, 'gameTestFiles');
