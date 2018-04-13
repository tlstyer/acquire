import * as React from 'react';

import { GameBoardType } from '../../enums';
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
    onChainSelected: (chain: GameBoardType) => void;
}

const typeToInstructions = {
    [SelectChainTitle.SelectNewChain]: 'New chain',
    [SelectChainTitle.SelectMergerSurvivor]: 'Merger survivor',
    [SelectChainTitle.SelectChainToDisposeOfNext]: 'Chain to dispose of next',
};

export class SelectChain extends React.PureComponent<SelectChainProps> {
    constructor(props: SelectChainProps) {
        super(props);
    }

    render() {
        const { type, availableChains, buttonSize, onChainSelected } = this.props;

        const buttonStyle = {
            width: buttonSize,
            height: buttonSize,
        };

        return (
            <fieldset className={style.root} style={{ fontSize: buttonSize * 2 / 5 }}>
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
                                onClick={() => onChainSelected(chain)}
                            />
                        );
                    } else {
                        return <input key={chain} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} />;
                    }
                })}
            </fieldset>
        );
    }
}
