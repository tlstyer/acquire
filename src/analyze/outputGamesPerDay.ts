import { iterateProcessedGameData, MovingAverage } from './misc';

async function main(processedGameDataFilePath: string, movingAverageLengthStr: string | undefined) {
  let movingAverageLength =
    movingAverageLengthStr !== undefined ? parseInt(movingAverageLengthStr, 10) : 1;
  if (!Number.isInteger(movingAverageLength) || movingAverageLength < 1) {
    movingAverageLength = 1;
  }

  const initialCounts: number[] = new Array(8);
  initialCounts.fill(0);

  const dateStrToCounts = new Map<string, number[]>();
  let earliestDate: Date | undefined;
  let latestDate: Date | undefined;

  for await (const processedGameData of iterateProcessedGameData(processedGameDataFilePath)) {
    let date = new Date(processedGameData.endTimestamp);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const dateStr = date.toLocaleDateString();

    if (!dateStrToCounts.has(dateStr)) {
      dateStrToCounts.set(dateStr, [...initialCounts]);
    }

    const counts = dateStrToCounts.get(dateStr)!;

    counts[processedGameData.gameMode - 1]++;
    counts[7]++;

    if (earliestDate === undefined || date < earliestDate) {
      earliestDate = date;
    }
    if (latestDate === undefined || date > latestDate) {
      latestDate = date;
    }
  }

  console.log(
    [
      'Date',
      'Singles 1',
      'Singles 2',
      'Singles 3',
      'Singles 4',
      'Singles 5',
      'Singles 6',
      'Teams 2 vs 2',
      'Total',
    ].join('\t'),
  );

  const movingAverages: MovingAverage[] = new Array(8);
  for (let i = 0; i < movingAverages.length; i++) {
    movingAverages[i] = new MovingAverage(movingAverageLength);
  }

  if (earliestDate && latestDate) {
    let date = new Date(earliestDate);
    while (date <= latestDate) {
      const dateStr = date.toLocaleDateString();
      const counts = dateStrToCounts.get(dateStr) ?? initialCounts;

      for (let i = 0; i < movingAverages.length; i++) {
        movingAverages[i].includeNewEntry(counts[i]);
      }

      console.log(
        [dateStr, ...movingAverages.map((movingAverage) => movingAverage.getAverage())].join('\t'),
      );

      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
  }
}

main(process.argv[2], process.argv[3]).catch((reason) => console.log(reason));
