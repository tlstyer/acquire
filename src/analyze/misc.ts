import fs from 'fs';
import path from 'path';

export function updateReviewGamePBBinary(gameReviewFileContents: Buffer) {
  const pathToFile = path.join(__dirname, '../../src/client/reviewGamePBBinary.ts');

  const currentContents = fs.readFileSync(pathToFile).toString();
  const desiredContents = `export const reviewGamePBBinary = new Uint8Array(${JSON.stringify([...gameReviewFileContents])});\n`;

  if (desiredContents !== currentContents) {
    fs.writeFileSync(pathToFile, desiredContents);
  }
}
