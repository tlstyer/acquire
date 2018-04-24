import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import * as commonStyle from '../common.css';
import { chains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getUniqueHtmlID } from '../helpers';
import * as style from './PurchaseShares.css';

export interface PurchaseSharesProps {
    scoreBoardAvailable: List<number>;
    scoreBoardPrice: List<number>;
    cash: number;
    buttonSize: number;
    onSharesPurchased: (chains: GameBoardType[], endGame: boolean) => void;
}

interface PurchaseSharesState {
    props: PurchaseSharesProps;
    cart: (GameBoardType | null)[];
    endGame: boolean;
}

export class PurchaseShares extends React.PureComponent<PurchaseSharesProps, PurchaseSharesState> {
    constructor(props: PurchaseSharesProps) {
        super(props);

        this.state = PurchaseShares._getDerivedStateFromProps(props);
    }

    static _getDerivedStateFromProps(props: PurchaseSharesProps): PurchaseSharesState {
        return {
            props,
            cart: [null, null, null],
            endGame: false,
        };
    }

    static getDerivedStateFromProps(nextProps: PurchaseSharesProps, prevState: PurchaseSharesState) {
        if (
            nextProps.scoreBoardAvailable !== prevState.props.scoreBoardAvailable ||
            nextProps.scoreBoardPrice !== prevState.props.scoreBoardPrice ||
            nextProps.cash !== prevState.props.cash
        ) {
            return PurchaseShares._getDerivedStateFromProps(nextProps);
        } else if (nextProps.buttonSize !== prevState.props.buttonSize || nextProps.onSharesPurchased !== prevState.props.onSharesPurchased) {
            return { ...prevState, props: nextProps };
        } else {
            return null;
        }
    }

    render() {
        const { scoreBoardAvailable, scoreBoardPrice, cash, buttonSize } = this.props;
        const { cart, endGame } = this.state;

        const chainToNumSharesInCart: { [key: number]: number } = {};
        let totalPrice = 0;
        let numItemsInCart = 0;
        for (let i = 0; i < 3; i++) {
            const chain = cart[i];
            if (chain !== null) {
                if (!chainToNumSharesInCart[chain]) {
                    chainToNumSharesInCart[chain] = 0;
                }

                chainToNumSharesInCart[chain]++;
                totalPrice += scoreBoardPrice.get(chain, 0);
                numItemsInCart++;
            }
        }
        const left = cash - totalPrice;

        const endGameID = getUniqueHtmlID();

        const buttonStyle = {
            width: buttonSize,
            height: buttonSize,
        };

        const cartButtonStyle = {
            width: Math.floor(buttonSize * 4 / 3),
            height: buttonSize,
        };

        return (
            <div className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
                <div className={style.topRow}>
                    <fieldset>
                        <legend>Available</legend>
                        {chains.map(chain => {
                            const numAvailable = scoreBoardAvailable.get(chain, 0);

                            if (numAvailable > 0) {
                                const numRemaining = numAvailable - (chainToNumSharesInCart[chain] ? chainToNumSharesInCart[chain] : 0);
                                const canAddThis = numItemsInCart < 3 && numRemaining > 0 && scoreBoardPrice.get(chain, 0) <= left;

                                if (canAddThis) {
                                    return (
                                        <input
                                            key={chain}
                                            type={'button'}
                                            className={commonStyle.hotelButton + ' ' + gameBoardTypeToCSSClassName[chain]}
                                            style={buttonStyle}
                                            value={gameBoardTypeToHotelInitial[chain]}
                                            onClick={() => {
                                                for (let i = 0; i < 3; i++) {
                                                    if (cart[i] === null) {
                                                        const cartCopy = [...cart];
                                                        cartCopy[i] = chain;
                                                        this.setState({ cart: cartCopy });
                                                        break;
                                                    }
                                                }
                                            }}
                                        />
                                    );
                                } else {
                                    return (
                                        <input
                                            key={chain}
                                            type={'button'}
                                            className={commonStyle.hotelButton}
                                            style={buttonStyle}
                                            value={gameBoardTypeToHotelInitial[chain]}
                                            disabled={true}
                                        />
                                    );
                                }
                            } else {
                                return <input key={chain} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} />;
                            }
                        })}
                    </fieldset>
                    <fieldset>
                        <legend>Cost</legend>
                        <table className={style.costTable}>
                            <tbody>
                                <tr>
                                    <td>Total</td>
                                    <td>{totalPrice * 100}</td>
                                </tr>
                                <tr>
                                    <td>Left</td>
                                    <td>{left * 100}</td>
                                </tr>
                            </tbody>
                        </table>
                    </fieldset>
                </div>
                <div>
                    <fieldset>
                        <legend>Cart</legend>
                        {cart.map((chain, i) => {
                            if (chain !== null) {
                                return (
                                    <input
                                        key={i}
                                        type={'button'}
                                        className={commonStyle.hotelButton + ' ' + gameBoardTypeToCSSClassName[chain]}
                                        style={cartButtonStyle}
                                        value={scoreBoardPrice.get(chain, 0) * 100}
                                        onClick={() => {
                                            const cartCopy = [...cart];
                                            cartCopy[i] = null;
                                            this.setState({ cart: cartCopy });
                                        }}
                                    />
                                );
                            } else {
                                return <input key={i} type={'button'} className={commonStyle.invisible} style={cartButtonStyle} value={'?'} />;
                            }
                        })}
                    </fieldset>
                    <input id={endGameID} type={'checkbox'} checked={endGame} onChange={this.handleEndGameCheckbox} />
                    <label htmlFor={endGameID}>End game</label>
                    <input type={'button'} value={'OK'} onClick={this.handleOK} />
                </div>
            </div>
        );
    }

    handleEndGameCheckbox = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ endGame: event.currentTarget.checked });
    };

    handleOK = () => {
        const chains: GameBoardType[] = [];
        for (let i = 0; i < this.state.cart.length; i++) {
            const entry = this.state.cart[i];
            if (entry !== null) {
                chains.push(entry);
            }
        }

        this.props.onSharesPurchased(chains, this.state.endGame);
    };
}
