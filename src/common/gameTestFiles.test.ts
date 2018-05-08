import * as fs from 'fs';
import * as path from 'path';

import { Game } from './game';
import { runGameTestFile } from './runGameTestFile';

const inputBasePath: string = `${__dirname}/gameTestFiles/`;
const outputBasePath: string = '';

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

                    if (game !== null && dir !== "from a user's perspective") {
                        const json = game.toJSON();
                        const game2 = Game.fromJSON(json);
                        const json2 = game2.toJSON();
                        expect(json2).toEqual(json);
                    }
                });
            }
        }
    });
}

processDirectory(__dirname, 'gameTestFiles');
