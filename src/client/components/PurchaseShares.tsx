import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import * as commonStyle from '../common.css';
import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getUniqueHtmlID } from '../helpers';
import * as style from './PurchaseShares.css';

export interface PurchaseSharesProps {
    scoreBoardAvailable: List<number>;
    scoreBoardPrice: List<number>;
    cash: number;
    buttonSize: number;
    keyboardShortcutsEnabled: boolean;
    onSharesPurchased: (chains: GameBoardType[], endGame: boolean) => void;
}

interface PurchaseSharesState {
    props: PurchaseSharesProps;
    cart: (GameBoardType | null)[];
    endGame: boolean;
}

const keyboardShortcutToAddedChain: { [key: string]: number } = {
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

const keyboardShortcutToRemovedChain: { [key: string]: number } = {
    '!': 0,
    L: 0,
    '@': 1,
    T: 1,
    '#': 2,
    A: 2,
    $: 3,
    F: 3,
    '%': 4,
    W: 4,
    '^': 5,
    C: 5,
    '&': 6,
    I: 6,
};

export class PurchaseShares extends React.Component<PurchaseSharesProps, PurchaseSharesState> {
    availableButtonRefs: React.RefObject<HTMLInputElement>[];
    endGameCheckboxRef: React.RefObject<HTMLInputElement>;
    okButtonRef: React.RefObject<HTMLInputElement>;

    constructor(props: PurchaseSharesProps) {
        super(props);

        this.availableButtonRefs = new Array(allChains.length);
        for (let i = 0; i < allChains.length; i++) {
            this.availableButtonRefs[i] = React.createRef();
        }

        this.endGameCheckboxRef = React.createRef();

        this.okButtonRef = React.createRef();

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

    shouldComponentUpdate(nextProps: PurchaseSharesProps, nextState: PurchaseSharesState) {
        // everything except props.keyboardShortcutsEnabled and state.props
        return (
            nextProps.scoreBoardAvailable !== this.props.scoreBoardAvailable ||
            nextProps.scoreBoardPrice !== this.props.scoreBoardPrice ||
            nextProps.cash !== this.props.cash ||
            nextProps.buttonSize !== this.props.buttonSize ||
            nextProps.onSharesPurchased !== this.props.onSharesPurchased ||
            nextState.cart !== this.state.cart ||
            nextState.endGame !== this.state.endGame
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

        if (keyboardShortcutToAddedChain.hasOwnProperty(keyName)) {
            const chain = keyboardShortcutToAddedChain[keyName];
            const button = this.availableButtonRefs[chain].current;
            if (button !== null) {
                button.focus();
                button.click();
            }
        } else if (keyboardShortcutToRemovedChain.hasOwnProperty(keyName)) {
            const chain = keyboardShortcutToRemovedChain[keyName];
            for (let i = 2; i >= 0; i--) {
                if (this.state.cart[i] === chain) {
                    const cart = [...this.state.cart];
                    cart[i] = null;
                    this.setState({ cart });
                    break;
                }
            }
        } else if (keyName === 'Backspace' || keyName === '-') {
            for (let i = 2; i >= 0; i--) {
                if (this.state.cart[i] !== null) {
                    const cart = [...this.state.cart];
                    cart[i] = null;
                    this.setState({ cart });
                    break;
                }
            }
        } else if (keyName === 'e' || keyName === '*') {
            const checkbox = this.endGameCheckboxRef.current;
            if (checkbox !== null) {
                checkbox.focus();
                this.setState({ endGame: !this.state.endGame });
            }
        } else if (keyName === '0' || keyName === '8' || keyName === 'o') {
            const button = this.okButtonRef.current;
            if (button !== null) {
                button.focus();
            }
        }
    };

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
                        {allChains.map(chain => {
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
                                            ref={this.availableButtonRefs[chain]}
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
                                            ref={this.availableButtonRefs[chain]}
                                        />
                                    );
                                }
                            } else {
                                return (
                                    <input
                                        key={chain}
                                        type={'button'}
                                        className={commonStyle.invisible}
                                        style={buttonStyle}
                                        value={'?'}
                                        ref={this.availableButtonRefs[chain]}
                                    />
                                );
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
                    <input id={endGameID} type={'checkbox'} checked={endGame} ref={this.endGameCheckboxRef} onChange={this.handleEndGameCheckbox} />
                    <label htmlFor={endGameID}>End game</label>
                    <input type={'button'} value={'OK'} ref={this.okButtonRef} onClick={this.handleOK} />
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
