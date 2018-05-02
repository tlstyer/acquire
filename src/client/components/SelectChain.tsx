import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import * as commonStyle from '../common.css';
import { chains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';
import * as style from './SelectChain.css';

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

const typeToInstructions = {
    [SelectChainTitle.SelectNewChain]: 'New chain',
    [SelectChainTitle.SelectMergerSurvivor]: 'Merger survivor',
    [SelectChainTitle.SelectChainToDisposeOfNext]: 'Chain to dispose of next',
};

const keyboardShortcutToChain: { [key: string]: number } = {
    1: 0,
    l: 0,
    2: 1,
    t: 1,
    3: 2,
    a: 2,
    4: 3,
    f: 3,
    5: 4,
    w: 4,
    6: 5,
    c: 5,
    7: 6,
    i: 6,
};

export class SelectChain extends React.Component<SelectChainProps> {
    buttonRefs: React.RefObject<HTMLInputElement>[];

    constructor(props: SelectChainProps) {
        super(props);

        this.buttonRefs = new Array(chains.length);
        for (let i = 0; i < chains.length; i++) {
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
        document.addEventListener('keydown', this.onDocumentKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onDocumentKeydown);
    }

    onDocumentKeydown = (event: KeyboardEvent) => {
        const keyName = event.key;

        if (this.props.keyboardShortcutsEnabled && keyboardShortcutToChain.hasOwnProperty(keyName)) {
            const tileIndex = keyboardShortcutToChain[keyName];
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
                    <legend>{typeToInstructions[type]}</legend>
                    {chains.map(chain => {
                        if (availableChains.indexOf(chain) >= 0) {
                            return (
                                <input
                                    key={chain}
                                    type={'button'}
                                    className={commonStyle.hotelButton + ' ' + gameBoardTypeToCSSClassName[chain]}
                                    style={buttonStyle}
                                    value={gameBoardTypeToHotelInitial[chain]}
                                    ref={this.buttonRefs[chain]}
                                    onClick={() => onChainSelected(chain)}
                                />
                            );
                        } else {
                            return (
                                <input
                                    key={chain}
                                    type={'button'}
                                    className={commonStyle.invisible}
                                    style={buttonStyle}
                                    value={'?'}
                                    ref={this.buttonRefs[chain]}
                                />
                            );
                        }
                    })}
                </fieldset>
            </div>
        );
    }
}
