import { assert } from 'chai';
import { List } from 'immutable';

import { defaultTileRackTypes } from './defaults';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { UserInputError } from './error';
import { Game, GameHistoryMessageData, MoveData } from './game';
import { ActionBase } from './gameActions/base';
import { ActionDisposeOfShares } from './gameActions/disposeOfShares';
import { ActionSelectChainToDisposeOfNext } from './gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from './gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from './gameActions/selectNewChain';

export function runGameTestFile(inputLines: string[]) {
    let game: Game | null = null;
    let tileBag: number[] = [];
    let userIDs: number[] = [];
    let starterUserID: number = 0;
    let myUserID: number | null = null;

    let outputLines: string[] = [];

    let lastMoveData: MoveData | null = null;

    for (let lineNumber = 0; lineNumber < inputLines.length; lineNumber++) {
        let line = inputLines[lineNumber];
        if (game === null) {
            if (line.length > 0) {
                const [key, value] = line.split(': ');
                switch (key) {
                    case 'tile bag':
                        tileBag = fromTilesString(value);

                        const duplicatedTiles = getDuplicatedTiles(tileBag);
                        if (duplicatedTiles.length > 0) {
                            outputLines.push(`duplicated tiles in tile bag: ${toTilesString(duplicatedTiles)}`);
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

            if (lastMoveData !== null) {
                outputLines.push(...getMoveDataLines(lastMoveData, line !== ''));
                lastMoveData = null;
            }

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
                    lastMoveData = game.moveDataHistory[game.moveDataHistory.length - 1];
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
                        outputLines.push(`  error: ${error.message}`);
                    } else {
                        outputLines.push(`line with unknown error: ${line}`);
                        outputLines.push(`  unknown error: ${error.toString()}`);
                        if (error instanceof Error) {
                            outputLines.push(`  stack trace: ${error.stack}`);
                        }
                    }
                }
            }
        }
    }

    outputLines.push('');

    return outputLines;
}

function getDuplicatedTiles(tileBag: number[]) {
    let tileCounts: { [key: number]: number } = {};
    for (let i = 0; i < tileBag.length; i++) {
        let tile = tileBag[i];
        if (typeof tileCounts[tile] === 'undefined') {
            tileCounts[tile] = 0;
        }
        tileCounts[tile]++;
    }

    let duplicatedTiles: number[] = [];
    for (let tile in tileCounts) {
        if (tileCounts.hasOwnProperty(tile)) {
            if (tileCounts[tile] > 1) {
                duplicatedTiles.push(parseInt(tile, 10));
            }
        }
    }

    return duplicatedTiles;
}

const abbreviationToGameBoardType: { [key: string]: GameBoardType } = {
    L: GameBoardType.Luxor,
    T: GameBoardType.Tower,
    A: GameBoardType.American,
    F: GameBoardType.Festival,
    W: GameBoardType.Worldwide,
    C: GameBoardType.Continental,
    I: GameBoardType.Imperial,
};

function fromParameterStrings(gameAction: GameAction, strings: string[]) {
    let parameters: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            parameters.push(fromTileString(strings[0]));
            break;
        case GameAction.SelectNewChain:
        case GameAction.SelectMergerSurvivor:
        case GameAction.SelectChainToDisposeOfNext:
            parameters.push(abbreviationToGameBoardType[strings[0]]);
            break;
        case GameAction.DisposeOfShares:
            parameters.push(...strings.map(s => parseInt(s, 10)));
            break;
        case GameAction.PurchaseShares:
            if (strings[0] === 'x') {
                parameters.push([]);
            } else {
                parameters.push(strings[0].split(',').map(s => abbreviationToGameBoardType[s]));
            }
            parameters.push(parseInt(strings[1]));
            break;
    }

    return parameters;
}

function toParameterStrings(gameAction: GameAction, parameters: any[]) {
    let strings: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            strings.push(toTileString(parameters[0]));
            break;
        case GameAction.SelectNewChain:
        case GameAction.SelectMergerSurvivor:
        case GameAction.SelectChainToDisposeOfNext:
            strings.push(gameBoardTypeToCharacter[parameters[0]]);
            break;
        case GameAction.DisposeOfShares:
            strings.push(...parameters.map(p => p.toString()));
            break;
        case GameAction.PurchaseShares:
            if (parameters[0].length === 0) {
                strings.push('x');
            } else {
                strings.push(parameters[0].map((p: number) => gameBoardTypeToCharacter[p]).join(','));
            }
            strings.push(parameters[1].toString());
            break;
    }

    return strings;
}

const gameBoardStringSpacer = '            ';

function getMoveDataLines(moveData: MoveData, detailed: boolean) {
    let lines: string[] = [];

    let arr = toParameterStrings(moveData.gameAction, moveData.gameActionParameters);
    let stringParameters = '';
    if (arr.length > 0) {
        stringParameters = ` ${arr.join(' ')}`;
    }
    lines.push(`action: ${moveData.playerID} ${GameAction[moveData.gameAction]}${stringParameters}`);

    if (detailed) {
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
            lines.push(`  ${lineParts.join('')}`);
        }

        lines.push('  tile racks:');
        moveData.tileRacks.forEach((tileRack, playerID) => {
            let tileTypes = moveData.tileRackTypes.get(playerID, defaultTileRackTypes);
            lines.push(`    ${playerID}: ${getTileRackString(tileRack, tileTypes)}`);
        });

        if (moveData.tileRackAdditions.length > 0) {
            const str = moveData.tileRackAdditions
                .map(tra => {
                    return toTileString(tra.tile) + ':' + tra.playerIDBelongsTo.toString();
                })
                .join(', ');
            lines.push(`  tile rack additions: ${str}`);
        }

        if (moveData.tileBagAdditions.length > 0) {
            const str = moveData.tileBagAdditions
                .map(tba => {
                    return toTileString(tba.tile) + ':' + (tba.playerIDWithPermission === null ? 'all' : tba.playerIDWithPermission.toString());
                })
                .join(', ');
            lines.push(`  tile bag additions: ${str}`);
        }

        lines.push('  history messages:');
        moveData.gameHistoryMessages.forEach(ghm => {
            lines.push(`    ${getGameHistoryMessageString(ghm)}`);
        });

        lines.push(`  next action: ${getNextActionString(moveData.nextGameAction)}`);
    }

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
function getGameBoardLines(gameBoard: List<GameBoardType>) {
    let lines: string[] = new Array(9);
    let chars: string[] = new Array(12);
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 12; x++) {
            chars[x] = gameBoardTypeToCharacter[gameBoard.get(x * 9 + y, 0)];
        }
        lines[y] = chars.join('');
    }
    return lines;
}

function getScoreBoardLines(
    scoreBoard: List<List<number>>,
    scoreBoardAvailable: List<number>,
    scoreBoardChainSize: List<number>,
    scoreBoardPrice: List<number>
) {
    let lines: string[] = [];
    lines.push(formatScoreBoardLine(['L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']));
    scoreBoard.forEach(row => {
        lines.push(formatScoreBoardLine(row.toArray().map((val, index) => (index <= ScoreBoardIndex.Imperial && val === 0 ? '' : val.toString()))));
    });
    lines.push(formatScoreBoardLine(scoreBoardAvailable.toArray().map(val => val.toString())));
    lines.push(formatScoreBoardLine(scoreBoardChainSize.toArray().map(val => (val === 0 ? '-' : val.toString()))));
    lines.push(formatScoreBoardLine(scoreBoardPrice.toArray().map(val => (val === 0 ? '-' : val.toString()))));
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

function getTileRackString(tiles: List<number | null>, tileTypes: List<GameBoardType | null>) {
    return tiles
        .map((tile, tileIndex) => {
            let tileType = tileTypes.get(tileIndex, 0);
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
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], GameBoardType[ghmd.parameters[0]][0], ...ghmd.parameters.slice(1)].join(' ');
};
const ghmshMergedChains = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], ghmd.parameters[0].map((x: GameBoardType) => GameBoardType[x][0]).join(',')].join(' ');
};
const ghmshPurchasedShares = (ghmd: GameHistoryMessageData) => {
    return [
        ghmd.playerID,
        GameHistoryMessage[ghmd.gameHistoryMessage],
        ghmd.parameters.length > 0 ? ghmd.parameters.map(([type, count]) => `${count}${GameBoardType[type][0]}`).join(',') : 'x',
    ].join(' ');
};

const gameHistoryMessageStringHandlers: { [key: number]: Function } = {
    [GameHistoryMessage.TurnBegan]: ghmshPlayerID,
    [GameHistoryMessage.DrewPositionTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.StartedGame]: ghmshPlayerID,
    [GameHistoryMessage.DrewTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.HasNoPlayableTile]: ghmshPlayerID,
    [GameHistoryMessage.PlayedTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.FormedChain]: ghmshPlayerIDType,
    [GameHistoryMessage.MergedChains]: ghmshMergedChains,
    [GameHistoryMessage.SelectedMergerSurvivor]: ghmshPlayerIDType,
    [GameHistoryMessage.SelectedChainToDisposeOfNext]: ghmshPlayerIDType,
    [GameHistoryMessage.ReceivedBonus]: ghmshPlayerIDType,
    [GameHistoryMessage.DisposedOfShares]: ghmshPlayerIDType,
    [GameHistoryMessage.CouldNotAffordAnyShares]: ghmshPlayerID,
    [GameHistoryMessage.PurchasedShares]: ghmshPurchasedShares,
    [GameHistoryMessage.DrewLastTile]: ghmshPlayerID,
    [GameHistoryMessage.ReplacedDeadTile]: ghmshPlayerIDTile,
    [GameHistoryMessage.EndedGame]: ghmshPlayerID,
    [GameHistoryMessage.NoTilesPlayedForEntireRound]: ghmsh,
    [GameHistoryMessage.AllTilesPlayed]: ghmsh,
};
function getGameHistoryMessageString(gameHistoryMessage: GameHistoryMessageData) {
    return gameHistoryMessageStringHandlers[gameHistoryMessage.gameHistoryMessage](gameHistoryMessage);
}

function getNextActionString(action: ActionBase) {
    const nextPlayerID = action.playerID;
    const nextActionName = action.constructor.name.slice(6);

    let parts: string[] = [nextPlayerID.toString(), nextActionName];

    if (action instanceof ActionSelectNewChain) {
        parts.push(action.availableChains.map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionSelectMergerSurvivor) {
        parts.push(action.chainsBySize[0].map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionSelectChainToDisposeOfNext) {
        parts.push(action.defunctChains.map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionDisposeOfShares) {
        parts.push(GameBoardType[action.defunctChain][0]);
    }

    return parts.join(' ');
}
