import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { UserInputError } from './error';
import { Game, GameHistoryMessageData, MoveData } from './game';

const inputBasePath: string = `${__dirname}/gameTestFiles/`;
const outputBasePath: string = '';

export function runGameTestFile(pathToFile: string) {
    const inputFileContents = fs.readFileSync(path.join(inputBasePath, pathToFile)).toString();

    let game: Game | null = null;
    let tileBag: number[] = [];
    let userIDs: number[] = [];
    let starterUserID: number = 0;
    let myUserID: number | null = null;

    const inputLines = inputFileContents.split('\n');
    let outputLines: string[] = [];

    for (let lineNumber = 0; lineNumber < inputLines.length; lineNumber++) {
        let line = inputLines[lineNumber];
        if (game === null) {
            if (line.length > 0) {
                const [key, value] = line.split(': ');
                switch (key) {
                    case 'tile bag':
                        tileBag = fromTilesString(value);

                        let unique = new Set(tileBag);
                        if (unique.size !== tileBag.length) {
                            outputLines.push('duplicate tiles in tile bag');
                        }
                        break;
                    case 'user IDs':
                        userIDs = value.split(', ').map(x => parseInt(x, 10));
                        break;
                    case 'starter user ID':
                        starterUserID = parseInt(value, 10);
                        break;
                    case 'my user ID':
                        myUserID = value === 'null' ? null : parseInt(value, 10);
                        break;
                    default:
                        outputLines.push(`unrecognized line: ${line}`);
                        break;
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

                const actualGameActionName = game.gameActionStack[game.gameActionStack.length - 1].constructor.name.slice(6);
                // @ts-ignore actualGameActionName is in GameAction
                const actualGameAction = GameAction[actualGameActionName];

                let parameters: any[] = [];
                let usingJSONParameters = false;
                if (actionParts.length > 2) {
                    if (actionParts[2] === '--') {
                        usingJSONParameters = true;
                        try {
                            parameters = JSON.parse(actionParts.slice(3).join(' '));
                        } catch (error) {
                            assert.isTrue(false, `line ${lineNumber} has invalid JSON`);
                        }
                        assert.isArray(parameters, `line ${lineNumber} has parameters that are not an array`);
                    } else {
                        parameters = fromParameterStrings(actualGameAction, actionParts.slice(2));
                    }
                }

                outputLines.push('');

                try {
                    game.doGameAction(userID, moveIndex, parameters);
                    outputLines.push(...getMoveDataLines(game.moveDataHistory[game.moveDataHistory.length - 1]));
                } catch (error) {
                    if (error instanceof UserInputError) {
                        let stringParameters = '';
                        if (usingJSONParameters) {
                            stringParameters = ` -- ${JSON.stringify(parameters)}`;
                        } else {
                            let arr = toParameterStrings(actualGameAction, parameters);
                            if (arr.length > 0) {
                                stringParameters = ` ${arr.join(' ')}`;
                            }
                        }

                        outputLines.push(`action: ${playerID} ${actualGameActionName}${stringParameters}`);
                        outputLines.push(`error: ${error.message}`);
                    } else {
                        outputLines.push(`line with unknown error: ${line}`);
                        outputLines.push(`unknown error: ${error.toString()}`);
                    }
                }
            }
        }
    }

    outputLines.push('');

    if (outputBasePath !== '') {
        let outputFilePath = path.join(outputBasePath, pathToFile);
        ensureDirectoryExistence(outputFilePath);
        fs.writeFileSync(outputFilePath, outputLines.join('\n'));
    }

    assert.deepEqual(outputLines, inputLines, 'output lines do not match input lines');
}

function fromParameterStrings(gameAction: GameAction, strings: string[]) {
    let parameters: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            parameters.push(fromTileString(strings[0]));
            break;
        // case GameAction.SelectNewChain:
        // case GameAction.SelectMergerSurvivor:
        // case GameAction.SelectChainToDisposeOfNext:
        // case GameAction.DisposeOfShares:
        // case GameAction.PurchaseShares:
    }

    return parameters;
}

function toParameterStrings(gameAction: GameAction, parameters: any[]) {
    let strings: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            strings.push(toTileString(parameters[0]));
            break;
        // case GameAction.SelectNewChain:
        // case GameAction.SelectMergerSurvivor:
        // case GameAction.SelectChainToDisposeOfNext:
        // case GameAction.DisposeOfShares:
        // case GameAction.PurchaseShares:
    }

    return strings;
}

const gameBoardStringSpacer = '            ';

function getMoveDataLines(moveData: MoveData) {
    let lines: string[] = [];

    let arr = toParameterStrings(moveData.gameAction, moveData.gameActionParameters);
    let stringParameters = '';
    if (arr.length > 0) {
        stringParameters = ` ${arr.join(' ')}`;
    }
    lines.push(`action: ${moveData.playerID} ${GameAction[moveData.gameAction]}${stringParameters}`);

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

    lines.push('tile racks:');
    moveData.tileRacks.forEach((tileRack, playerID) => {
        let tileTypes = moveData.tileRackTypes[playerID];
        lines.push(`  ${playerID}: ${getTileRackString(tileRack, tileTypes)}`);
    });

    lines.push('new known tiles:');
    moveData.newPlayerKnownTiles.forEach((tiles, playerID) => {
        if (tiles.length > 0) {
            lines.push(`  ${playerID}: ${toTilesString(tiles)}`);
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
function getGameBoardLines(gameBoard: GameBoardType[]) {
    let lines: string[] = new Array(9);
    let chars: string[] = new Array(12);
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 12; x++) {
            chars[x] = gameBoardTypeToCharacter[gameBoard[x * 9 + y]];
        }
        lines[y] = chars.join('');
    }
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

function getTileRackString(tiles: (number | null)[], tileTypes: (GameBoardType | null)[]) {
    return tiles
        .map((tile, tileIndex) => {
            let tileType = tileTypes[tileIndex];
            if (tile !== null && tileType !== null) {
                return `${toTileString(tile)}(${gameBoardTypeToCharacter[tileType]})`;
            } else {
                return 'none';
            }
        })
        .join(' ');
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
