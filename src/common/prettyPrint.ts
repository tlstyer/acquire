import { GameSetupChange, MessageToClient, MessageToServer } from './enums';
import { ErrorCode, GameMode, PlayerArrangementMode } from './pb';

function constructEnum(name: string, value: string) {
  return `{[<(${name}.${value})>]}`;
}

function removeDelimiters(input: string) {
  return input.replace(/"{\[<\(/g, '').replace(/\)>\]}"/g, '');
}

export function prettyPrintMessagesToClient(messages: any[]) {
  messages = messages.map((message) => {
    message = [...message];

    switch (message[0]) {
      case MessageToClient.FatalError:
        message[1] = constructEnum('ErrorCode', ErrorCode[message[1]]);
        break;

      case MessageToClient.Greetings:
        message[3] = message[3].map((m: any[]) => {
          m = [...m];
          if (m[0] === 0) {
            // game being set up
            m[3] = constructEnum('GameMode', GameMode[m[3]]);
            m[4] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[m[4]]);
          } else {
            // game
            if (m.length > 4) {
              m[4] = constructEnum('GameMode', GameMode[m[4]]);
              m[5] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[m[5]]);
            }
          }
          return m;
        });
        break;

      case MessageToClient.GameCreated:
        message[3] = constructEnum('GameMode', GameMode[message[3]]);
        break;

      case MessageToClient.GameSetupChanged:
        switch (message[2]) {
          case GameSetupChange.GameModeChanged:
            message[3] = constructEnum('GameMode', GameMode[message[3]]);
            break;

          case GameSetupChange.PlayerArrangementModeChanged:
            message[3] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[message[3]]);
            break;
        }

        message[2] = constructEnum('GameSetupChange', GameSetupChange[message[2]]);
        break;
    }

    message[0] = constructEnum('MessageToClient', MessageToClient[message[0]]);

    return message;
  });

  console.log(removeDelimiters(JSON.stringify(messages, null, 2)));
}

export function prettyPrintMessageToServer(message: any[]) {
  message = [...message];

  switch (message[0]) {
    case MessageToServer.CreateGame:
      message[1] = constructEnum('GameMode', GameMode[message[1]]);
      break;

    case MessageToServer.ChangeGameMode:
      message[1] = constructEnum('GameMode', GameMode[message[1]]);
      break;

    case MessageToServer.ChangePlayerArrangementMode:
      message[1] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[message[1]]);
      break;
  }

  message[0] = constructEnum('MessageToServer', MessageToServer[message[0]]);

  console.log(removeDelimiters(JSON.stringify(message, null, 2)));
}
