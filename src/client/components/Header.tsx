import * as React from 'react';
import * as style from './Header.css';

export interface HeaderProps {
    username: string;
    isConnected: boolean;
}

export class Header extends React.PureComponent<HeaderProps> {
    render() {
        const { username, isConnected } = this.props;

        return (
            <div className={style.root}>
                <span>Acquire</span>
                <span>{username}</span>
                {isConnected ? <span className={style.connected}>Connected</span> : <span className={style.reconnecting}>Reconnecting</span>}
            </div>
        );
    }
}
