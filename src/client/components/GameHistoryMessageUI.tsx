import { Match, Switch } from 'solid-js';
import {
  type GameHistoryMessage,
  GameHistoryMessageAllTilesPlayed,
  GameHistoryMessageCouldNotAffordAnyShares,
  GameHistoryMessageDisposedOfShares,
  GameHistoryMessageDrewLastTile,
  GameHistoryMessageDrewPositionTile,
  GameHistoryMessageDrewTile,
  GameHistoryMessageEndedGame,
  GameHistoryMessageFormedChain,
  GameHistoryMessageHasNoPlayableTile,
  GameHistoryMessageMergedChains,
  GameHistoryMessageNoTilesPlayedForEntireRound,
  GameHistoryMessagePlayedTile,
  GameHistoryMessagePurchasedShares,
  GameHistoryMessageReceivedBonus,
  GameHistoryMessageReplacedDeadTile,
  GameHistoryMessageSelectedChainToDisposeOfNext,
  GameHistoryMessageSelectedMergerSurvivor,
  GameHistoryMessageStartedGame,
  GameHistoryMessageTurnBegan,
} from '../../common/gameHistoryMessage.js';
import { toTileString } from '../../common/helpers.js';
import { type User } from '../../common/user.js';
import styles from './GameHistoryMessageUI.module.css';
import { HotelName } from './HotelName.jsx';
import { Username } from './Username.jsx';

export function GameHistoryMessageUI(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessage;
}) {
  return (
    <div>
      <Switch fallback={<>Mystery message!</>}>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageTurnBegan}>
          <div class={styles.turnBegan}>
            <hr />
            <Username
              username={
                props.users[(props.gameHistoryMessage as GameHistoryMessageTurnBegan).playerId].name
              }
            />
            <hr />
          </div>
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageDrewPositionTile).playerId]
                .name
            }
          />{' '}
          drew position tile{' '}
          {toTileString((props.gameHistoryMessage as GameHistoryMessageDrewPositionTile).tile)}.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageStartedGame}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageStartedGame).playerId].name
            }
          />{' '}
          started the game.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewTile}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageDrewTile).playerId].name
            }
          />{' '}
          drew tile {toTileString((props.gameHistoryMessage as GameHistoryMessageDrewTile).tile)}.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile}>
          <Username
            username={
              props.users[
                (props.gameHistoryMessage as GameHistoryMessageHasNoPlayableTile).playerId
              ].name
            }
          />{' '}
          has no playable tile.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePlayedTile}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessagePlayedTile).playerId].name
            }
          />{' '}
          played tile{' '}
          {toTileString((props.gameHistoryMessage as GameHistoryMessagePlayedTile).tile)}.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageFormedChain}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageFormedChain).playerId].name
            }
          />{' '}
          formed{' '}
          <HotelName chain={(props.gameHistoryMessage as GameHistoryMessageFormedChain).chain} />.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageMergedChains}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageMergedChains).playerId]
                .name
            }
          />{' '}
          merged{' '}
          <Switch>
            <Match
              when={
                (props.gameHistoryMessage as GameHistoryMessageMergedChains).chains.length === 2
              }
            >
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[0]}
              />{' '}
              and{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[1]}
              />
              .
            </Match>
            <Match
              when={
                (props.gameHistoryMessage as GameHistoryMessageMergedChains).chains.length === 3
              }
            >
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[0]}
              />
              ,{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[1]}
              />
              , and{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[2]}
              />
              .
            </Match>
            <Match when={true}>
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[0]}
              />
              ,{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[1]}
              />
              ,{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[2]}
              />
              , and{' '}
              <HotelName
                chain={(props.gameHistoryMessage as GameHistoryMessageMergedChains).chains[3]}
              />
              .
            </Match>
          </Switch>
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor}>
          <Username
            username={
              props.users[
                (props.gameHistoryMessage as GameHistoryMessageSelectedMergerSurvivor).playerId
              ].name
            }
          />{' '}
          selected{' '}
          <HotelName
            chain={(props.gameHistoryMessage as GameHistoryMessageSelectedMergerSurvivor).chain}
          />{' '}
          as merger survivor.
        </Match>
        <Match
          when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext}
        >
          <Username
            username={
              props.users[
                (props.gameHistoryMessage as GameHistoryMessageSelectedChainToDisposeOfNext)
                  .playerId
              ].name
            }
          />{' '}
          selected{' '}
          <HotelName
            chain={
              (props.gameHistoryMessage as GameHistoryMessageSelectedChainToDisposeOfNext).chain
            }
          />{' '}
          as chain to dispose of next.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReceivedBonus}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageReceivedBonus).playerId]
                .name
            }
          />{' '}
          received a ${(props.gameHistoryMessage as GameHistoryMessageReceivedBonus).amount * 100}{' '}
          <HotelName chain={(props.gameHistoryMessage as GameHistoryMessageReceivedBonus).chain} />{' '}
          bonus.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageDisposedOfShares).playerId]
                .name
            }
          />{' '}
          traded {(props.gameHistoryMessage as GameHistoryMessageDisposedOfShares).tradeAmount} and
          sold {(props.gameHistoryMessage as GameHistoryMessageDisposedOfShares).sellAmount}{' '}
          <HotelName
            chain={(props.gameHistoryMessage as GameHistoryMessageDisposedOfShares).chain}
          />{' '}
          shares.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares}>
          <Username
            username={
              props.users[
                (props.gameHistoryMessage as GameHistoryMessageCouldNotAffordAnyShares).playerId
              ].name
            }
          />{' '}
          could not afford any shares.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePurchasedShares}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessagePurchasedShares).playerId]
                .name
            }
          />{' '}
          purchased{' '}
          <Switch>
            <Match
              when={
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts
                  .length === 0
              }
            >
              nothing.
            </Match>
            <Match
              when={
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts
                  .length === 1
              }
            >
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                    .chain
                }
              />
              .
            </Match>
            <Match
              when={
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts
                  .length === 2
              }
            >
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                    .chain
                }
              />{' '}
              and{' '}
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[1]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[1]
                    .chain
                }
              />
              .
            </Match>
            <Match when={true}>
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[0]
                    .chain
                }
              />
              ,{' '}
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[1]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[1]
                    .chain
                }
              />
              , and{' '}
              {
                (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[2]
                  .count
              }{' '}
              <HotelName
                chain={
                  (props.gameHistoryMessage as GameHistoryMessagePurchasedShares).chainsAndCounts[2]
                    .chain
                }
              />
              .
            </Match>
          </Switch>
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewLastTile}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageDrewLastTile).playerId]
                .name
            }
          />{' '}
          drew the last tile from the tile bag.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageReplacedDeadTile).playerId]
                .name
            }
          />{' '}
          replaced dead tile{' '}
          {toTileString((props.gameHistoryMessage as GameHistoryMessageReplacedDeadTile).tile)}.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageEndedGame}>
          <Username
            username={
              props.users[(props.gameHistoryMessage as GameHistoryMessageEndedGame).playerId].name
            }
          />{' '}
          ended the game.
        </Match>
        <Match
          when={props.gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound}
        >
          No tiles played for an entire round. Game end forced.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed}>
          All tiles have been played. Game end forced.
        </Match>
      </Switch>
    </div>
  );
}
