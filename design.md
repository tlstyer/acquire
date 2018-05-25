# Game setup

The host picks the initial game mode, which is one of:

*   Singles 1
*   Singles 2
*   Singles 3
*   Singles 4
*   Singles 5
*   Singles 6
*   Teams 2 vs 2
*   Teams 2 vs 2 vs 2
*   Teams 3 vs 3

The host can later change the game mode to any mode which requires the same or more than the number of users who are already in the game.

The host can choose the arrangement of the players, one of:

*   Random order
    *   Player order will be randomized
*   Exact order
    *   This exact player order will be used
*   Specify teams (team games only)
    *   Can arrange the users into teams
    *   Player order will be randomized, but the teams selected will be honored

When the game has the required number of players and everybody has accepted the setup, then the game is automatically started.

When the host changes the setup, everybody's acceptance is reset.

The host can "kick" a user, which removes them from the game.

Users can leave a game.

# Real-time protocol

## Login

Client sends:

*   Version
*   Username
*   Password
*   Game data:
    *   Game ID
    *   Move data history size
*   Game ID to join (the game client was in before being disconnected)

On unsuccessful connection request, server sends:

*   MessageToClient.FatalError
*   ErrorCode

On successful connection request, server sends:

*   MessageToClient.Greetings
*   Users:
    *   User ID
    *   Username
    *   Clients (exclude if none):
        *   Client ID
        *   Game display number (excluded if not in a game)
*   Client ID
*   Games being set up:
    *   Game ID
    *   Game display number
    *   JSON parameters
*   Games:
    *   Game ID
    *   Move history messages (skipping the messages the client already knows)
    *   Game display number (excluded if client knows about this game)
    *   Game mode (excluded if client knows about this game)
    *   Player arrangement mode (excluded if client knows about this game)
    *   User IDs (excluded if client knows about this game)
    *   Host user ID (excluded if client knows about this game)
*   Game IDs that are not active anymore (exclude if empty)

On successful connection request, server sends other clients:

*   MessageToClient.ClientConnected
*   Client ID
*   User ID
*   Username (exclude if already known)

## Disconnection

Server sends other clients:

*   MessageToClient.ClientDisconnected
*   Client ID

## Create game

Client sends:

*   MessageToServer.CreateGame
*   Game mode

Server sends all clients:

*   MessageToClient.GameCreated
*   Game ID
*   Game display number
*   Game mode
*   Host client ID

Server sends all clients:

*   MessageToClient.ClientEnteredGame
*   Client ID
*   Game display number

# Game review data

Array of:

*   Game mode
*   Player arrangement mode
*   Time control starting amount (in seconds, null meaning infinite)
*   Time control increment amount (in seconds)
*   User ID array in player order
*   User name array in player order
*   User ID of host
*   Tile bag array
    *   0 for 1A, 1 for 1B, 2 for 1C, ...
    *   9 for 2A, 10 for 2B, 11 for 2C, ...
*   Game actions
    *   Only the parameters
    *   Timestamp
        *   If previous game action had a timestamp, then milliseconds since previous game action
        *   Otherwise, milliseconds since Unix epoch
        *   If timestamp is unknown, then exclude it
    *   Whether game action was automatically played due to time expiry or forfeit
        *   1 for yes
        *   Excluded for no

May add later:

*   When forfeits occurred

# Game history message types and their parameters

| game history message type    | has playerID? | parameters                      |
| ---------------------------- | ------------- | ------------------------------- |
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
| -------------------------- | ----------------------- |
| StartGame                  |                         |
| PlayTile                   | tile                    |
| SelectNewChain             | typeId                  |
| SelectMergerSurvivor       | typeId                  |
| SelectChainToDisposeOfNext | typeId                  |
| DisposeOfShares            | tradeAmount, sellAmount |
| PurchaseShares             | typeId[], endGame       |
| GameOver                   |                         |
