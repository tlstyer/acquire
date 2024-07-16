import { GAME_PROTOCOL_BUFFER_BINARIES_DIR } from '$env/static/private';
import fs from 'fs/promises';
import path from 'path';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  let gamePBBinary: number[] | undefined;

  const gameIDMatch = params.gameID.match(/^(\d+)-(\d+)$/);
  if (gameIDMatch) {
    try {
      gamePBBinary = [
        ...(await fs.readFile(
          path.join(GAME_PROTOCOL_BUFFER_BINARIES_DIR, gameIDMatch[1], gameIDMatch[2]),
        )),
      ];
    } catch (error) {
      // ignore
    }
  }

  return {
    gamePBBinary,
  };
}) satisfies PageServerLoad;
