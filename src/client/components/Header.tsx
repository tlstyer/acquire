import * as React from 'react';
import * as style from './Header.scss';

export interface HeaderProps {
  username: string;
  isConnected: boolean;
}

export const Header = React.memo(function Header({ username, isConnected }: HeaderProps) {
  return (
    <div className={style.root}>
      <span>Acquire</span>
      <span>{username}</span>
      {isConnected ? <span className={style.connected}>Connected</span> : <span className={style.reconnecting}>Reconnecting</span>}
    </div>
  );
});
