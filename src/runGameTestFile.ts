import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { Game, GameHistoryMessageData, MoveData } from './game';
import { getNewTileBag } from './gamePreparation';

const outputBasePath: string = '';

export function runGameTestFile(pathToFile: string) {
    const inputFileContents = fs.readFileSync(`${__dirname}/gameTestFiles/${pathToFile}`).toString();

    let game: Game | null = null;
    let tileBag: number[] = [];
    let userIDs: number[] = [];
    let starterUserID: number = 0;
    let myUserID: number | null = null;

    const inputLines = inputFileContents.split('\n');
    let outputLines: string[] = [];

    for (let i = 0; i < inputLines.length; i++) {
        let line = inputLines[i];
        if (game === null) {
            if (line.length > 0) {
                const [key, value] = line.split(': ');
                switch (key) {
                    case 'tile bag':
                        tileBag = fromTilesString(value);
                        break;
                    case 'user IDs':
                        userIDs = value.split(', ').map(x => parseInt(x, 10));
                        break;
                    case 'starter user ID':
                        starterUserID = parseInt(value, 10);
                        break;
                    case 'my user ID':
                        myUserID = parseInt(value, 10);
                        break;
                    default:
                        outputLines.push(`unrecognized line: ${line}`);
                }
            } else {
                outputLines.push(`tile bag: ${toTilesString(tileBag)}`);
                outputLines.push(`user IDs: ${userIDs.join(', ')}`);
                outputLines.push(`starter user ID: ${starterUserID}`);
                outputLines.push(`my user ID: ${myUserID}`);
                game = new Game(tileBag, userIDs, starterUserID, myUserID);
            }
        } else {
            const lineParts = line.split(': ');
            if (lineParts.length === 2 && lineParts[0] === 'action') {
                const actionParts = lineParts[1].split(' ');

                const playerID = parseInt(actionParts[0], 10);

                const userID: number = game.userIDs[playerID];
                const moveIndex: number = game.moveDataHistory.length;
                const parameters: any[] = [];
                game.doGameAction(userID, moveIndex, parameters);
            }
        }
    }

    if (game !== null) {
        game.moveDataHistory.forEach((moveData, index) => {
            outputLines.push('');
            outputLines.push(...getMoveDataLines(moveData));
        });
    }
    outputLines.push('');

    if (outputBasePath !== '') {
        let outputFilePath = path.join(outputBasePath, pathToFile);
        ensureDirectoryExistence(outputFilePath);
        fs.writeFileSync(outputFilePath, outputLines.join('\n'));
    }

    assert.deepEqual(outputLines, inputLines, 'output lines do not match input lines');
}

const gameBoardStringSpacer = '            ';

function getMoveDataLines(moveData: MoveData) {
    let lines: string[] = [];

    lines.push(`action: ${moveData.playerID} ${GameAction[moveData.gameAction]}`);

    const gameBoardLines = getGameBoardLines(moveData.gameBoard);
    const scoreBoardLines = getScoreBoardLines(moveData.scoreBoard, moveData.scoreBoardAvailable, moveData.scoreBoardChainSize, moveData.scoreBoardPrice);
    const numLines = Math.max(gameBoardLines.length, scoreBoardLines.length);
    for (let i = 0; i < numLines; i++) {
        let lineParts = [];
        lineParts.push(i < gameBoardLines.length ? gameBoardLines[i] : gameBoardStringSpacer);
        if (i < scoreBoardLines.length) {
            lineParts.push('  ');
            lineParts.push(scoreBoardLines[i]);
        }
        lines.push(lineParts.join(''));
    }

    lines.push('new known tiles:');
    moveData.newPlayerKnownTiles.forEach((tiles, playerIndex) => {
        if (tiles.length > 0) {
            lines.push(`  ${playerIndex}: ${toTilesString(tiles)}`);
        }
    });
    if (moveData.newWatcherKnownTiles.length > 0) {
        lines.push(`  w: ${toTilesString(moveData.newWatcherKnownTiles)}`);
    }

    lines.push('history messages:');
    moveData.gameHistoryMessages.forEach(ghm => {
        lines.push(`  ${getGameHistoryMessageString(ghm)}`);
    });

    return lines;
}

const gameBoardTypeToCharacter: { [key: number]: string } = {
    [GameBoardType.Luxor]: 'L',
    [GameBoardType.Tower]: 'T',
    [GameBoardType.American]: 'A',
    [GameBoardType.Festival]: 'F',
    [GameBoardType.Worldwide]: 'W',
    [GameBoardType.Continental]: 'C',
    [GameBoardType.Imperial]: 'I',
    [GameBoardType.Nothing]: '·',
    [GameBoardType.NothingYet]: 'O',
    [GameBoardType.CantPlayEver]: '█',
    [GameBoardType.IHaveThis]: 'i',
    [GameBoardType.WillPutLonelyTileDown]: 'l',
    [GameBoardType.HaveNeighboringTileToo]: 'h',
    [GameBoardType.WillFormNewChain]: 'n',
    [GameBoardType.WillMergeChains]: 'm',
    [GameBoardType.CantPlayNow]: 'c',
};
function getGameBoardLines(gameBoard: GameBoardType[][]) {
    let lines: string[] = [];
    gameBoard.forEach(row => {
        let chars = row.map(char => gameBoardTypeToCharacter[char]);
        lines.push(chars.join(''));
    });
    return lines;
}

function getScoreBoardLines(scoreBoard: number[][], scoreBoardAvailable: number[], scoreBoardChainSize: number[], scoreBoardPrice: number[]) {
    let lines: string[] = [];
    lines.push(formatScoreBoardLine(['L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']));
    scoreBoard.forEach(row => {
        let entries = row.map((val, index) => (index <= ScoreBoardIndex.Imperial && val === 0 ? '' : val.toString()));
        lines.push(formatScoreBoardLine(entries));
    });
    lines.push(formatScoreBoardLine(scoreBoardAvailable.map(val => val.toString())));
    lines.push(formatScoreBoardLine(scoreBoardChainSize.map(val => (val === 0 ? '-' : val.toString()))));
    lines.push(formatScoreBoardLine(scoreBoardPrice.map(val => (val === 0 ? '-' : val.toString()))));
    return lines;
}

const scoreBoardColumnWidths = [2, 2, 2, 2, 2, 2, 2, 4, 4];
function formatScoreBoardLine(entries: string[]) {
    let lineParts = entries.map((entry, index) => {
        const numSpacesToAdd = scoreBoardColumnWidths[index] - entry.length;
        if (numSpacesToAdd === 1) {
            entry = ' ' + entry;
        } else if (numSpacesToAdd === 2) {
            entry = '  ' + entry;
        } else if (numSpacesToAdd === 3) {
            entry = '   ' + entry;
        }
        return entry;
    });
    return lineParts.join(' ');
}

function toTilesString(tiles: number[]) {
    return tiles.map(toTileString).join(', ');
}

function fromTilesString(str: string) {
    return str.split(', ').map(fromTileString);
}

const yTileNames = 'ABCDEFGHI';

function toTileString(tile: number) {
    let x = Math.floor(tile / 9) + 1;
    let y = yTileNames[tile % 9];
    return x + y;
}

function fromTileString(str: string) {
    let x = parseInt(str.slice(0, str.length - 1), 10) - 1;
    let y = yTileNames.indexOf(str.slice(str.length - 1));
    return x * 9 + y;
}

const ghmsh = (ghmd: GameHistoryMessageData) => {
    return GameHistoryMessage[ghmd.gameHistoryMessage];
};
const ghmshPlayerID = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage]].join(' ');
};
const ghmshPlayerIDTile = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], toTileString(ghmd.parameters[0])].join(' ');
};
const ghmshPlayerIDType = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], GameBoardType[ghmd.parameters[0]], ...ghmd.parameters.slice(1)].join(' ');
};
const ghmshPlayerIDTypes = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], ghmd.parameters[0].map((x: GameBoardType) => GameBoardType[x])].join(' ');
};

const gameHistoryMessageStringHandlers: { [key: number]: Function } = {
    [GameHistoryMessage.TurnBegan]: ghmshPlayerID,
    [GameHistoryMessage.DrewPositionTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.StartedGame]: ghmshPlayerID,
    [GameHistoryMessage.DrewTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.HasNoPlayableTile]: ghmshPlayerID,
    [GameHistoryMessage.PlayedTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.FormedChain]: ghmshPlayerIDType,
    [GameHistoryMessage.MergedChains]: ghmshPlayerIDTypes,
    [GameHistoryMessage.SelectedMergerSurvivor]: ghmshPlayerIDType,
    [GameHistoryMessage.SelectedChainToDisposeOfNext]: ghmshPlayerIDType,
    [GameHistoryMessage.ReceivedBonus]: ghmshPlayerIDType,
    [GameHistoryMessage.DisposedOfShares]: ghmshPlayerIDType,
    [GameHistoryMessage.CouldNotAffordAnyShares]: ghmshPlayerID,
    [GameHistoryMessage.PurchasedShares]: ghmshPlayerIDTypes,
    [GameHistoryMessage.DrewLastTile]: ghmshPlayerID,
    [GameHistoryMessage.ReplacedDeadTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.EndedGame]: ghmshPlayerID,
    [GameHistoryMessage.NoTilesPlayedForEntireRound]: ghmsh,
    [GameHistoryMessage.AllTilesPlayed]: ghmsh,
};

function getGameHistoryMessageString(gameHistoryMessage: GameHistoryMessageData) {
    return gameHistoryMessageStringHandlers[gameHistoryMessage.gameHistoryMessage](gameHistoryMessage);
}

// from https://stackoverflow.com/questions/13542667/create-directory-when-writing-to-file-in-node-js
function ensureDirectoryExistence(filePath: string) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
