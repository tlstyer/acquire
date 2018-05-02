import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import * as commonStyle from '../common.css';
import { gameBoardTypeToCSSClassName, getTileString } from '../helpers';
import * as style from './TileRack.css';

export interface TileRackProps {
    tiles: List<number | null>;
    types: List<GameBoardType | null>;
    buttonSize: number;
    isPrimaryComponent: boolean;
    onTileClicked: (tile: number) => void;
}

const keyboardShortcutToTileIndex: { [key: string]: number } = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
};

export class TileRack extends React.Component<TileRackProps> {
    buttonRefs: React.RefObject<HTMLInputElement>[];

    constructor(props: TileRackProps) {
        super(props);

        this.buttonRefs = new Array(6);
        for (let i = 0; i < 6; i++) {
            this.buttonRefs[i] = React.createRef();
        }
    }

    shouldComponentUpdate(nextProps: TileRackProps) {
        // everything except isPrimaryComponent
        return (
            nextProps.tiles != this.props.tiles ||
            nextProps.types != this.props.types ||
            nextProps.buttonSize != this.props.buttonSize ||
            nextProps.onTileClicked != this.props.onTileClicked
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

        if (this.props.isPrimaryComponent && keyboardShortcutToTileIndex.hasOwnProperty(keyName)) {
            const tileIndex = keyboardShortcutToTileIndex[keyName];
            const button = this.buttonRefs[tileIndex].current;
            if (button !== null) {
                button.focus();
            }
        }
    };

    render() {
        const { tiles, types, buttonSize, onTileClicked } = this.props;

        let buttons = new Array(tiles.size);

        const buttonStyle = {
            width: buttonSize,
            height: buttonSize,
        };

        for (let i = 0; i < tiles.size; i++) {
            const tile = tiles.get(i, 0);
            const type = types.get(i, 0);

            if (tile !== null && type !== null) {
                const disabled = type === GameBoardType.CantPlayEver || type === GameBoardType.CantPlayNow;
                buttons[i] = (
                    <input
                        key={i}
                        type={'button'}
                        className={commonStyle.hotelButton + ' ' + gameBoardTypeToCSSClassName[type]}
                        style={buttonStyle}
                        value={getTileString(tile)}
                        disabled={disabled}
                        ref={this.buttonRefs[i]}
                        onClick={() => onTileClicked(tile)}
                    />
                );
            } else {
                buttons[i] = <input key={i} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} ref={this.buttonRefs[i]} />;
            }
        }

        return (
            <div className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
                {buttons}
            </div>
        );
    }
}
