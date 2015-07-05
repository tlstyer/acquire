lookups = {
    'CommandsToClient': [
        'FatalError',
        'SetClientId',
        'SetClientIdToData',
        'SetGameState',
        'SetGameBoardCell',
        'SetGameBoard',
        'SetScoreSheetCell',
        'SetScoreSheet',
        'SetGamePlayerJoin',
        'SetGamePlayerRejoin',
        'SetGamePlayerLeave',
        'SetGamePlayerJoinMissing',
        'SetGameWatcherClientId',
        'ReturnWatcherToLobby',
        'AddGameHistoryMessage',
        'AddGameHistoryMessages',
        'SetTurn',
        'SetGameAction',
        'SetTile',
        'SetTileGameBoardType',
        'RemoveTile',
        'AddGlobalChatMessage',
        'AddGameChatMessage',
        'DestroyGame',
        # defunct
        'SetGamePlayerUsername',
        'SetGamePlayerClientId',
    ],
    'CommandsToServer': [
        'CreateGame',
        'JoinGame',
        'RejoinGame',
        'WatchGame',
        'LeaveGame',
        'DoGameAction',
        'SendGlobalChatMessage',
        'SendGameChatMessage',
    ],
    'Errors': [
        'NotUsingLatestVersion',
        'GenericError',
        'InvalidUsername',
        'InvalidPassword',
        'MissingPassword',
        'ProvidedPassword',
        'IncorrectPassword',
        'NonMatchingPasswords',
        'ExistingPassword',
        'UsernameAlreadyInUse',
        'LostConnection',
    ],
    'GameActions': [
        'StartGame',
        'PlayTile',
        'SelectNewChain',
        'SelectMergerSurvivor',
        'SelectChainToDisposeOfNext',
        'DisposeOfShares',
        'PurchaseShares',
        'GameOver',
    ],
    'GameBoardTypes': [
        'Luxor',
        'Tower',
        'American',
        'Festival',
        'Worldwide',
        'Continental',
        'Imperial',
        'Nothing',
        'NothingYet',
        'CantPlayEver',
        'IHaveThis',
        'WillPutLonelyTileDown',
        'HaveNeighboringTileToo',
        'WillFormNewChain',
        'WillMergeChains',
        'CantPlayNow',
        'Max',
    ],
    'GameHistoryMessages': [
        'TurnBegan',
        'DrewPositionTile',
        'StartedGame',
        'DrewTile',
        'HasNoPlayableTile',
        'PlayedTile',
        'FormedChain',
        'MergedChains',
        'SelectedMergerSurvivor',
        'SelectedChainToDisposeOfNext',
        'ReceivedBonus',
        'DisposedOfShares',
        'CouldNotAffordAnyShares',
        'PurchasedShares',
        'DrewLastTile',
        'ReplacedDeadTile',
        'EndedGame',
        'NoTilesPlayedForEntireRound',
        'AllTilesPlayed',
    ],
    'GameModes': [
        'Singles',
        'Teams',
        'Max',
    ],
    'GameStates': [
        'Starting',
        'StartingFull',
        'InProgress',
        'Completed',
    ],
    'Notifications': [
        'GameFull',
        'GameStarted',
        'YourTurn',
        'GameOver',
    ],
    'Options': [
        'EnablePageTitleNotifications',
        'EnableSoundNotifications',
        'Sound',
        'EnableHighContrastColors',
        'EnableTextBackgroundColors',
        'ColorScheme',
        'GameBoardLabelMode',
    ],
    'ScoreSheetIndexes': [
        'Luxor',
        'Tower',
        'American',
        'Festival',
        'Worldwide',
        'Continental',
        'Imperial',
        'Cash',
        'Net',
        'Username',
        'PositionTile',
        'Client',
    ],
    'ScoreSheetRows': [
        'Player0',
        'Player1',
        'Player2',
        'Player3',
        'Player4',
        'Player5',
        'Available',
        'ChainSize',
        'Price',
    ]
}

_lookups_changes = {
    1417176502: {
        'CommandsToClient': [
            'FatalError',
            'SetClientId',
            'SetClientIdToData',
            'SetGameState',
            'SetGameBoardCell',
            'SetGameBoard',
            'SetScoreSheetCell',
            'SetScoreSheet',
            'SetGamePlayerUsername',
            'SetGamePlayerClientId',
            'SetGameWatcherClientId',
            'ReturnWatcherToLobby',
            'AddGameHistoryMessage',
            'AddGameHistoryMessages',
            'SetTurn',
            'SetGameAction',
            'SetTile',
            'SetTileGameBoardType',
            'RemoveTile',
            'AddGlobalChatMessage',
            'AddGameChatMessage',
            'DestroyGame',
        ],
    },
    1409233190: {
        'Errors': [
            'NotUsingLatestVersion',
            'InvalidUsername',
            'UsernameAlreadyInUse',
        ],
    },
}

_translations = {}


def _initialize():
    for timestamp, changes in _lookups_changes.items():
        translation = {}
        for enum_name, entries in changes.items():
            entry_to_new_index = {entry: index for index, entry in enumerate(lookups[enum_name])}
            old_index_to_new_index = {index: entry_to_new_index[entry] for index, entry in enumerate(entries)}
            translation[enum_name] = old_index_to_new_index
        _translations[timestamp] = translation


def get_translations(timestamp=None):
    if timestamp is None:
        return {}

    translations_for_timestamp = {}
    for trans_timestamp, trans_changes in sorted(_translations.items(), reverse=True):
        if timestamp <= trans_timestamp:
            translations_for_timestamp.update(trans_changes)

    return translations_for_timestamp


class CommandsToClientTranslator:
    def __init__(self, translations):
        self.commands_to_client = translations.get('CommandsToClient')
        self.errors = translations.get('Errors')

        self.fatal_error = lookups['CommandsToClient'].index('FatalError')

    def translate(self, commands):
        if self.commands_to_client:
            for command in commands:
                command[0] = self.commands_to_client[command[0]]

        if self.errors:
            for command in commands:
                if command[0] == self.fatal_error:
                    command[1] = self.errors[command[1]]


_initialize()
