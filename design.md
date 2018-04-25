# Game setup
The host picks the initial game mode, which is one of:
* Singles 1
* Singles 2
* Singles 3
* Singles 4
* Singles 5
* Singles 6
* Teams 2 vs 2
* Teams 2 vs 2 vs 2
* Teams 3 vs 3

The host can later change the game mode to any mode which requires the same or more than the number of users who are already in the game.

The host can choose the arrangement of the players, one of:
* Random order
    * Player order will be randomized
* Exact order
    * This exact player order will be used
* Specify teams (team games only)
    * Can arrange the users into teams
    * Player order will be randomized, but the teams selected will be honored

When the game has the required number of players and everybody has accepted the setup, then the game is automatically started.

When the host changes the setup, everybody's acceptance is reset.

The host can "kick" a user, which removes them from the game.

Users can leave a game.

# Game review data
Array of:
* Game mode
* Time control starting amount (in seconds, null meaning infinite)
* Time control increment amount (in seconds)
* User ID array in player order
* User name array in player order
* User ID of starter
* Tile bag array
    * 0 for 1A, 1 for 1B, 2 for 1C, ...
    * 9 for 2A, 10 for 2B, 11 for 2C, ...
* Game actions
    * Only the parameters
    * Timestamp
        * First game action contains milliseconds since Unix epoch
        * Subsequent game actions contain an offset from the previous game action
        * If timestamp is unknown, then exclude it
    * Whether game action was automatically played due to time expiry or forfeit
        * 1 for yes
        * Excluded for no
* Game end timestamp

May add later:
* When forfeits occurred

# Game history message types and their parameters
| game history message type    | has playerID? | parameters                      |
|------------------------------|---------------|---------------------------------|
| TurnBegan                    | yes           |                                 |
| DrewPositionTile             | yes           | tile                            |
| StartedGame                  | yes           |                                 |
| DrewTile                     | yes           | tile                            |
| HasNoPlayableTile            | yes           |                                 |
| PlayedTile                   | yes           | tile                            |
| FormedChain                  | yes           | typeID                          |
| MergedChains                 | yes           | typeID[]                        |
| SelectedMergerSurvivor       | yes           | typeID                          |
| SelectedChainToDisposeOfNext | yes           | typeID                          |
| ReceivedBonus                | yes           | typeID, bonus                   |
| DisposedOfShares             | yes           | typeID, tradeAmount, sellAmount |
| CouldNotAffordAnyShares      | yes           |                                 |
| PurchasedShares              | yes           | [typeID, count][]               |
| DrewLastTile                 | yes           |                                 |
| ReplacedDeadTile             | yes           | tile                            |
| EndedGame                    | yes           |                                 |
| NoTilesPlayedForEntireRound  | no            |                                 |
| AllTilesPlayed               | no            |                                 |

# Game action types and their parameters
| game action type           | parameters              |
|----------------------------|-------------------------|
| StartGame                  |                         |
| PlayTile                   | tile                    |
| SelectNewChain             | typeId                  |
| SelectMergerSurvivor       | typeId                  |
| SelectChainToDisposeOfNext | typeId                  |
| DisposeOfShares            | tradeAmount, sellAmount |
| PurchaseShares             | typeId[], endGame       |
| GameOver                   |                         |
