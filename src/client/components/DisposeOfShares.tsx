import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName } from '../helpers';
import * as style from './DisposeOfShares.css';

export interface DisposeOfSharesProps {
    defunctChain: GameBoardType;
    controllingChain: GameBoardType;
    sharesOwnedInDefunctChain: number;
    sharesAvailableInControllingChain: number;
    keyboardShortcutsEnabled: boolean;
    onSharesDisposed: (traded: number, sold: number) => void;
}

interface DisposeOfSharesState {
    props: DisposeOfSharesProps;
    keep: number;
    trade: number;
    tradeMax: number;
    sell: number;
    sellMax: number;
}

const keyboardShortcutToButtonIndex = new Map<string, number>([
    ['1', 0],
    ['k', 0],
    ['2', 1],
    ['t', 1],
    ['3', 2],
    ['T', 2],
    ['4', 3],
    ['5', 4],
    ['s', 4],
    ['6', 5],
    ['S', 5],
    ['7', 6],
    ['0', 7],
    ['8', 7],
    ['o', 7],
]);

export class DisposeOfShares extends React.Component<DisposeOfSharesProps, DisposeOfSharesState> {
    buttonRefs: React.RefObject<HTMLInputElement>[];

    constructor(props: DisposeOfSharesProps) {
        super(props);

        this.buttonRefs = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.buttonRefs[i] = React.createRef();
        }

        this.state = DisposeOfShares._getDerivedStateFromProps(props);
    }

    static _getDerivedStateFromProps(props: DisposeOfSharesProps): DisposeOfSharesState {
        return {
            props,
            keep: props.sharesOwnedInDefunctChain,
            trade: 0,
            tradeMax: Math.min(Math.floor(props.sharesOwnedInDefunctChain / 2) * 2, props.sharesAvailableInControllingChain * 2),
            sell: 0,
            sellMax: props.sharesOwnedInDefunctChain,
        };
    }

    static getDerivedStateFromProps(nextProps: DisposeOfSharesProps, prevState: DisposeOfSharesState) {
        if (
            nextProps.defunctChain !== prevState.props.defunctChain ||
            nextProps.controllingChain !== prevState.props.controllingChain ||
            nextProps.sharesOwnedInDefunctChain !== prevState.props.sharesOwnedInDefunctChain ||
            nextProps.sharesAvailableInControllingChain !== prevState.props.sharesAvailableInControllingChain
        ) {
            return DisposeOfShares._getDerivedStateFromProps(nextProps);
        } else {
            return null;
        }
    }

    shouldComponentUpdate(nextProps: DisposeOfSharesProps, nextState: DisposeOfSharesState) {
        // everything except props.keyboardShortcutsEnabled and state.props
        return (
            nextProps.defunctChain !== this.props.defunctChain ||
            nextProps.controllingChain !== this.props.controllingChain ||
            nextProps.sharesOwnedInDefunctChain !== this.props.sharesOwnedInDefunctChain ||
            nextProps.sharesAvailableInControllingChain !== this.props.sharesAvailableInControllingChain ||
            nextProps.onSharesDisposed !== this.props.onSharesDisposed ||
            nextState.keep !== this.state.keep ||
            nextState.trade !== this.state.trade ||
            nextState.tradeMax !== this.state.tradeMax ||
            nextState.sell !== this.state.sell ||
            nextState.sellMax !== this.state.sellMax
        );
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onWindowKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onWindowKeydown);
    }

    onWindowKeydown = (event: KeyboardEvent) => {
        if (!this.props.keyboardShortcutsEnabled) {
            return;
        }

        const keyName = event.key;

        if (keyboardShortcutToButtonIndex.hasOwnProperty(keyName)) {
            const buttonIndex = keyboardShortcutToButtonIndex.get(keyName)!;
            const button = this.buttonRefs[buttonIndex].current;
            if (button !== null) {
                button.focus();
                if (buttonIndex < 7) {
                    button.click();
                }
            }
        }
    };

    render() {
        const { defunctChain, controllingChain, sharesOwnedInDefunctChain } = this.props;
        const { keep, trade, tradeMax, sell, sellMax } = this.state;

        const keepAllDisabled = keep === sharesOwnedInDefunctChain;
        const tradeIncrementAndMaxDisabled = trade === tradeMax;
        const tradeDecrementDisabled = trade === 0;
        const sellIncrementAndMaxDisabled = sell === sellMax;
        const sellDecrementDisabled = sell === 0;

        return (
            <div className={style.root}>
                <fieldset className={gameBoardTypeToCSSClassName.get(defunctChain)}>
                    <legend className={gameBoardTypeToCSSClassName.get(defunctChain)}>Keep</legend>
                    <span>{keep}</span>
                    <input
                        type={'button'}
                        value={'All'}
                        disabled={keepAllDisabled}
                        ref={this.buttonRefs[0]}
                        onClick={keepAllDisabled ? undefined : this.handleKeepAll}
                    />
                </fieldset>
                <fieldset className={gameBoardTypeToCSSClassName.get(controllingChain)}>
                    <legend className={gameBoardTypeToCSSClassName.get(controllingChain)}>Trade</legend>
                    <span>{trade}</span>
                    <input
                        type={'button'}
                        value={'▲'}
                        disabled={tradeIncrementAndMaxDisabled}
                        ref={this.buttonRefs[1]}
                        onClick={tradeIncrementAndMaxDisabled ? undefined : this.handleTradeIncrement}
                    />
                    <input
                        type={'button'}
                        value={'▼'}
                        disabled={tradeDecrementDisabled}
                        ref={this.buttonRefs[2]}
                        onClick={tradeDecrementDisabled ? undefined : this.handleTradeDecrement}
                    />
                    <input
                        type={'button'}
                        value={'Max'}
                        disabled={tradeIncrementAndMaxDisabled}
                        ref={this.buttonRefs[3]}
                        onClick={tradeIncrementAndMaxDisabled ? undefined : this.handleTradeMax}
                    />
                </fieldset>
                <fieldset>
                    <legend>Sell</legend>
                    <span>{sell}</span>
                    <input
                        type={'button'}
                        value={'▲'}
                        disabled={sellIncrementAndMaxDisabled}
                        ref={this.buttonRefs[4]}
                        onClick={sellIncrementAndMaxDisabled ? undefined : this.handleSellIncrement}
                    />
                    <input
                        type={'button'}
                        value={'▼'}
                        disabled={sellDecrementDisabled}
                        ref={this.buttonRefs[5]}
                        onClick={sellDecrementDisabled ? undefined : this.handleSellDecrement}
                    />
                    <input
                        type={'button'}
                        value={'Max'}
                        disabled={sellIncrementAndMaxDisabled}
                        ref={this.buttonRefs[6]}
                        onClick={sellIncrementAndMaxDisabled ? undefined : this.handleSellMax}
                    />
                </fieldset>
                <input type={'button'} value={'OK'} ref={this.buttonRefs[7]} onClick={this.handleOK} />
            </div>
        );
    }

    handleKeepAll = () => this.determineNewState(-this.state.trade, -this.state.sell);
    handleTradeIncrement = () => this.determineNewState(2, 0);
    handleTradeDecrement = () => this.determineNewState(-2, 0);
    handleTradeMax = () => this.determineNewState(this.state.tradeMax - this.state.trade, 0);
    handleSellIncrement = () => this.determineNewState(0, 1);
    handleSellDecrement = () => this.determineNewState(0, -1);
    handleSellMax = () => this.determineNewState(0, this.state.sellMax - this.state.sell);
    handleOK = () => this.props.onSharesDisposed(this.state.trade, this.state.sell);

    determineNewState(tradeChange: number, sellChange: number) {
        const trade = this.state.trade + tradeChange;
        const sell = this.state.sell + sellChange;

        const keep = this.props.sharesOwnedInDefunctChain - trade - sell;
        const tradeMax = Math.min(trade + Math.floor(keep / 2) * 2, this.props.sharesAvailableInControllingChain * 2);
        const sellMax = sell + keep;

        this.setState({ keep, trade, tradeMax, sell, sellMax });
    }
}
