import * as commonStyle from '../common.scss';
import * as style from './SelectChain.scss';

import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';

export enum SelectChainTitle {
  SelectNewChain,
  SelectMergerSurvivor,
  SelectChainToDisposeOfNext,
}

export interface SelectChainProps {
  type: SelectChainTitle;
  availableChains: GameBoardType[];
  buttonSize: number;
  keyboardShortcutsEnabled: boolean;
  onChainSelected: (chain: GameBoardType) => void;
}

const typeToInstructions = new Map([
  [SelectChainTitle.SelectNewChain, 'New chain'],
  [SelectChainTitle.SelectMergerSurvivor, 'Merger survivor'],
  [SelectChainTitle.SelectChainToDisposeOfNext, 'Chain to dispose of next'],
]);

const keyboardShortcutToChain = new Map([
  ['1', 0],
  ['l', 0],
  ['2', 1],
  ['t', 1],
  ['3', 2],
  ['a', 2],
  ['4', 3],
  ['f', 3],
  ['5', 4],
  ['w', 4],
  ['6', 5],
  ['c', 5],
  ['7', 6],
  ['i', 6],
]);

export class SelectChain extends React.Component<SelectChainProps> {
  buttonRefs: React.RefObject<HTMLInputElement>[];

  constructor(props: SelectChainProps) {
    super(props);

    this.buttonRefs = new Array(allChains.length);
    for (let i = 0; i < allChains.length; i++) {
      this.buttonRefs[i] = React.createRef();
    }
  }

  shouldComponentUpdate(nextProps: SelectChainProps) {
    // everything except keyboardShortcutsEnabled
    return (
      nextProps.type !== this.props.type ||
      nextProps.availableChains !== this.props.availableChains ||
      nextProps.buttonSize !== this.props.buttonSize ||
      nextProps.onChainSelected !== this.props.onChainSelected
    );
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeydown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeydown);
  }

  onWindowKeydown = (event: KeyboardEvent) => {
    if (!this.props.keyboardShortcutsEnabled) {
      return;
    }

    const keyName = event.key;

    if (keyboardShortcutToChain.has(keyName)) {
      const tileIndex = keyboardShortcutToChain.get(keyName)!;
      const button = this.buttonRefs[tileIndex].current;
      if (button !== null) {
        button.focus();
      }
    }
  };

  render() {
    const { type, availableChains, buttonSize, onChainSelected } = this.props;

    const buttonStyle = {
      width: buttonSize,
      height: buttonSize,
    };

    return (
      <div>
        <fieldset className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
          <legend>{typeToInstructions.get(type)}</legend>
          {allChains.map((chain) => {
            if (availableChains.indexOf(chain) >= 0) {
              return (
                <input
                  key={chain}
                  type={'button'}
                  className={`${commonStyle.hotelButton} ${gameBoardTypeToCSSClassName.get(chain)}`}
                  style={buttonStyle}
                  value={gameBoardTypeToHotelInitial.get(chain)}
                  ref={this.buttonRefs[chain]}
                  onClick={() => onChainSelected(chain)}
                />
              );
            } else {
              return <input key={chain} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} ref={this.buttonRefs[chain]} />;
            }
          })}
        </fieldset>
      </div>
    );
  }
}
