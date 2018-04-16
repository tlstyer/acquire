import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName } from '../helpers';
import * as style from './DisposeOfShares.css';

export interface DisposeOfSharesProps {
    defunctChain: GameBoardType;
    controllingChain: GameBoardType;
    sharesOwnedInDefunctChain: number;
    sharesAvailableInControllingChain: number;
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

export class DisposeOfShares extends React.PureComponent<DisposeOfSharesProps, DisposeOfSharesState> {
    constructor(props: DisposeOfSharesProps) {
        super(props);

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

    render() {
        const { defunctChain, controllingChain, sharesOwnedInDefunctChain } = this.props;
        const { keep, trade, tradeMax, sell, sellMax } = this.state;

        return (
            <div className={style.root}>
                <fieldset className={gameBoardTypeToCSSClassName[defunctChain]}>
                    <legend className={gameBoardTypeToCSSClassName[defunctChain]}>Keep</legend>
                    <span>{keep}</span>
                    <input type={'button'} value={'All'} disabled={keep == sharesOwnedInDefunctChain} onClick={this.handleKeepAll} />
                </fieldset>
                <fieldset className={gameBoardTypeToCSSClassName[controllingChain]}>
                    <legend className={gameBoardTypeToCSSClassName[controllingChain]}>Trade</legend>
                    <span>{trade}</span>
                    <input type={'button'} value={'▲'} disabled={trade === tradeMax} onClick={this.handleTradeIncrement} />
                    <input type={'button'} value={'▼'} disabled={trade === 0} onClick={this.handleTradeDecrement} />
                    <input type={'button'} value={'Max'} disabled={trade === tradeMax} onClick={this.handleTradeMax} />
                </fieldset>
                <fieldset>
                    <legend>Sell</legend>
                    <span>{sell}</span>
                    <input type={'button'} value={'▲'} disabled={sell === sellMax} onClick={this.handleSellIncrement} />
                    <input type={'button'} value={'▼'} disabled={sell === 0} onClick={this.handleSellDecrement} />
                    <input type={'button'} value={'Max'} disabled={sell === sellMax} onClick={this.handleSellMax} />
                </fieldset>
                <input type={'button'} value={'OK'} onClick={this.handleOK} />
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
