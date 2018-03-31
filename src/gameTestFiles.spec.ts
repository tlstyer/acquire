import * as fs from 'fs';
import * as path from 'path';

import { runGameTestFile } from './runGameTestFile';

const inputBasePath: string = `${__dirname}/gameTestFiles/`;

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
                const relativeFilePath = filePath.slice(inputBasePath.length);
                it(file, () => runGameTestFile(relativeFilePath));
            }
        }
    });
}

processDirectory(__dirname, 'gameTestFiles');
