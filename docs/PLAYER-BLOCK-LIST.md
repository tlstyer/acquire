# Player Block Lists

## Purpose

Prevent unwanted players and scripted game-bombing clients from joining games
created by users who have blocked them.

## User interface

Each registered user has a server-side block list.

The format is one entry per line:

    bad-player1
    107.77.
    192.145.119.

## Matching rules

- Blank lines are ignored.
- Leading and trailing whitespace is ignored.
- A complete IPv4 address matches that exact address.
- An IPv4 prefix ending with a period matches any address beginning with it.
- All other entries are matched against usernames.
- Username matching is case-insensitive.

## Enforcement

- Enforcement occurs on the Python server before accepting a new game join.
- Hiding or disabling the Join button is secondary and is not relied upon for security.
- Watching a game is allowed.
- Rejoining an existing seat is allowed.
- Updating a block list does not remove players already in a game.

## Database change

Migration:

    migrations/001-add-user-block-list.sql

Adds:

    user.block_list TEXT NULL
