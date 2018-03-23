import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from './enums';
import { Game, GameHistoryMessageData, MoveData } from './game';
import { getNewTileBag } from './gamePreparation';

function main() {
    let game = new Game(getNewTileBag(), [5, 7, 9], 7, 5);

    console.log('________________________________________________________________________________');

    game.doGameAction(7, 0, []);

    game.moveDataHistory.forEach((moveData, index) => {
        console.log();
        console.log(getMoveDataString(moveData));
    });
}

const gameBoardStringSpacer = '            ';

function getMoveDataString(moveData: MoveData) {
    let parts: string[] = [];

    parts.push(`action: ${moveData.playerID} ${GameAction[moveData.gameAction]}`);

    const gameBoardStrings = getGameBoardStrings(moveData.gameBoard);
    const scoreBoardStrings = getScoreBoardStrings(moveData.scoreBoard, moveData.scoreBoardAvailable, moveData.scoreBoardChainSize, moveData.scoreBoardPrice);
    const numLines = Math.max(gameBoardStrings.length, scoreBoardStrings.length);
    for (let i = 0; i < numLines; i++) {
        let lineParts = [];
        lineParts.push(i < gameBoardStrings.length ? gameBoardStrings[i] : gameBoardStringSpacer);
        if (i < scoreBoardStrings.length) {
            lineParts.push('  ');
            lineParts.push(scoreBoardStrings[i]);
        }
        parts.push(lineParts.join(''));
    }

    parts.push('new known tiles:');
    moveData.newPlayerKnownTiles.forEach((tiles, playerIndex) => {
        if (tiles.length > 0) {
            parts.push(`  ${playerIndex}: ${getTileStrings(tiles)}`);
        }
    });
    if (moveData.newWatcherKnownTiles.length > 0) {
        parts.push(`  w: ${getTileStrings(moveData.newWatcherKnownTiles)}`);
    }

    parts.push('history messages:');
    moveData.gameHistoryMessages.forEach(ghm => {
        parts.push(`  ${getGameHistoryMessageString(ghm)}`);
    });

    return parts.join('\n');
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
function getGameBoardStrings(gameBoard: GameBoardType[][]) {
    let parts: string[] = [];
    gameBoard.forEach(row => {
        let chars = row.map(char => gameBoardTypeToCharacter[char]);
        parts.push(chars.join(''));
    });
    return parts;
}

function getScoreBoardStrings(scoreBoard: number[][], scoreBoardAvailable: number[], scoreBoardChainSize: number[], scoreBoardPrice: number[]) {
    let parts: string[] = [];
    parts.push(formatScoreBoardLine(['L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']));
    scoreBoard.forEach(row => {
        let entries = row.map((val, index) => (index <= ScoreBoardIndex.Imperial && val === 0 ? '' : val.toString()));
        parts.push(formatScoreBoardLine(entries));
    });
    parts.push(formatScoreBoardLine(scoreBoardAvailable.map(val => val.toString())));
    parts.push(formatScoreBoardLine(scoreBoardChainSize.map(val => (val === 0 ? '-' : val.toString()))));
    parts.push(formatScoreBoardLine(scoreBoardPrice.map(val => (val === 0 ? '-' : val.toString()))));
    return parts;
}

const scoreBoardColumnWidths = [2, 2, 2, 2, 2, 2, 2, 4, 4];
function formatScoreBoardLine(entries: string[]) {
    let parts = entries.map((entry, index) => {
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
    return parts.join(' ');
}

function getTileStrings(tiles: number[]) {
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
