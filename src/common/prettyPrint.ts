import { GameSetupChangeEnum, MessageToClientEnum, MessageToServerEnum } from './enums';
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
      case MessageToClientEnum.FatalError:
        message[1] = constructEnum('ErrorCode', ErrorCode[message[1]]);
        break;

      case MessageToClientEnum.Greetings:
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

      case MessageToClientEnum.GameCreated:
        message[3] = constructEnum('GameMode', GameMode[message[3]]);
        break;

      case MessageToClientEnum.GameSetupChanged:
        switch (message[2]) {
          case GameSetupChangeEnum.GameModeChanged:
            message[3] = constructEnum('GameMode', GameMode[message[3]]);
            break;

          case GameSetupChangeEnum.PlayerArrangementModeChanged:
            message[3] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[message[3]]);
            break;
        }

        message[2] = constructEnum('GameSetupChange', GameSetupChangeEnum[message[2]]);
        break;
    }

    message[0] = constructEnum('MessageToClient', MessageToClientEnum[message[0]]);

    return message;
  });

  console.log(removeDelimiters(JSON.stringify(messages, null, 2)));
}

export function prettyPrintMessageToServer(message: any[]) {
  message = [...message];

  switch (message[0]) {
    case MessageToServerEnum.CreateGame:
      message[1] = constructEnum('GameMode', GameMode[message[1]]);
      break;

    case MessageToServerEnum.ChangeGameMode:
      message[1] = constructEnum('GameMode', GameMode[message[1]]);
      break;

    case MessageToServerEnum.ChangePlayerArrangementMode:
      message[1] = constructEnum('PlayerArrangementMode', PlayerArrangementMode[message[1]]);
      break;
  }

  message[0] = constructEnum('MessageToServer', MessageToServerEnum[message[0]]);

  console.log(removeDelimiters(JSON.stringify(message, null, 2)));
}
