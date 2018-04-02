import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import { ensureDirectoryExists } from './helpers';
import { runGameTestFile } from './runGameTestFile';

const inputBasePath: string = `${__dirname}/gameTestFiles/`;
const outputBasePath: string = '';

function processDirectory(base: string, dir: string) {
    describe(base === __dirname ? 'game test files' : dir, () => {
        const dirPath = path.join(base, dir);
        const files = fs.readdirSync(dirPath);

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
                    const outputLines = runGameTestFile(inputLines);

                    if (outputBasePath !== '') {
                        const outputFilePath = path.join(outputBasePath, filePath.slice(inputBasePath.length));
                        ensureDirectoryExists(outputFilePath);
                        fs.writeFileSync(outputFilePath, outputLines.join('\n'));
                    }

                    assert.deepEqual(outputLines, inputLines, 'output lines do not match input lines');
                });
            }
        }
    });
}

processDirectory(__dirname, 'gameTestFiles');
