import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { Game, GameHistoryMessageData, MoveData } from './game';
import { getNewTileBag } from './gamePreparation';

function main() {
    console.log('________________________________________________________________________________');

    let game = new Game(getNewTileBag(), [5, 7, 9], 7, 5);

    let lines: string[] = [];

    game.doGameAction(7, 0, []);

    game.moveDataHistory.forEach((moveData, index) => {
        lines.push('');
        lines.push(...getMoveDataLines(moveData));
    });

    console.log(lines.join('\n'));
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
            lines.push(`  ${playerIndex}: ${getTilesString(tiles)}`);
        }
    });
    if (moveData.newWatcherKnownTiles.length > 0) {
        lines.push(`  w: ${getTilesString(moveData.newWatcherKnownTiles)}`);
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

function getTilesString(tiles: number[]) {
    return tiles.map(getTileString).join(', ');
}

function getTileString(tile: number) {
    let x = Math.floor(tile / 9) + 1;
    let y = 'ABCDEFGHI'[tile % 9];
    return x + y;
}

const ghmsh = (ghmd: GameHistoryMessageData) => {
    return GameHistoryMessage[ghmd.gameHistoryMessage];
};
const ghmshPlayerID = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage]].join(' ');
};
const ghmshPlayerIDTile = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], getTileString(ghmd.parameters[0])].join(' ');
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

main();
