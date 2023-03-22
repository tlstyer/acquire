# Connect

If server's version is different from client's version, then client should reload page.

## Protocol

### Receive

- version
- log time

# Login / Create User / Logout

## Protocol

### Send

One of:

- login with password (using login form)
  - username
  - password
- login with token (when there's a token in local storage)
  - username
  - token
- create user and login
  - username
  - password
- logout

### Receive

- response code, one of:
  - Success
  - GenericError - An error occurred during the processing of your request.
  - UserNotFound - User not found.
  - IncorrectPassword - Password is incorrect.
  - InvalidToken - (I guess don't show an error and be not logged in.)
  - InvalidUsername - Invalid username. Username must have between 1 and 32 ASCII characters.
  - InvalidPassword - Invalid password. Password must have at least 8 characters.
  - UserExists - User already exists.
- username (empty if error or just logged out)
- user ID (empty if error or just logged out)
- token (empty if error or just logged out)

# Lobby page

## Data needed

- game data for each game to show
  - game number
  - game display number
  - if Setting Up
    - GameSetup data (except for user approvals)
  - if In Progress or Completed
    - game status
    - game mode
    - game board
    - user IDs in player order
- user IDs in each game room
- recent chat messages and user IDs of senders (how far back?)
- usernames of all user IDs mentioned

## Protocol

### Send

Connect:

- last event index

Send Chat Message:

- message

### Receive

- last state checkpoint (if server doesn't have all events since client's last event)
  - games
    - game number
    - game display number
    - game mode
    - host user ID
    - user IDs
    - game board changes (if In Progress or Completed)
  - chat messages
    - user ID
    - message
  - users
    - user ID
    - username
    - is in lobby?
    - game display numbers of game rooms where user is present
  - last event index
- events since last event, one of:
  - game created
    - game number
    - game display number
    - game mode
    - host user ID
  - game setup change
    - game display number
    - GameSetupChange
  - game board changes
    - game display number
    - game board changes
  - game completed
    - game display number
  - game removed from lobby
    - game display number
  - chat message
    - user ID
    - message
  - add user to lobby
    - user ID
    - username (if new)
  - remove user from lobby
    - user ID
  - add user to game room
    - user ID
    - game display number
    - username (if new)
  - remove user from game room
    - user ID
    - game display number

# Game page

## Data needed

When game shown on Lobby page:

- game data
  - when Setting Up:
    - GameSetup data
  - when In Progress
    - Game data
    - player-specific move history
  - when Completed
    - Game data
    - player-specific move history
    - tile bag
- user IDs in game room
- all chat messages and user IDs of senders
- usernames of all user IDs mentioned

When game not shown on Lobby page:

- game review data

## Protocol

### Send

Connect:

- log time
- game number
- game state history size
- number of chat messages
- number of user IDs and usernames

Game setup action:

- number of game setup changes
- game setup action

Game action:

- game state history size
- game action

Send chat message:

- message

### Receive

One or more of:

- metadata
  - game mode
  - player arrangement mode
  - host user ID
  - user IDs
  - approvals (if Setting Up)
  - number of game setup changes (if Setting Up)
- game setup change
- array of game state history objects
- array of chat messages and user IDs of senders
- array of user IDs and usernames
- user ID who entered game room
- user ID who exited game room
- tile bag (after game completed)
- game review data (no other fields are sent if this is sent)
