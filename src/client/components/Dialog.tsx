import { Match, Show, Switch } from 'solid-js';
import { Client } from '../client';
import { CreateUser } from './CreateUser';
import styles from './Dialog.module.css';
import { Login } from './Login';
import { Logout } from './Logout';
import { Settings } from './Settings';

export function Dialog(props: { client: Client }) {
  return (
    <Show when={props.client.dialogTypeSignal() !== undefined}>
      <div class={styles.root}>
        <div class={styles.header}>
          <span class={styles.title}>
            {dialogTypeToTitle.get(props.client.dialogTypeSignal()!)}
          </span>
          <span class={styles.close} onClick={() => props.client.setDialogType(undefined)}>
            &nbsp;x&nbsp;
          </span>
        </div>
        <Switch>
          <Match when={props.client.dialogTypeSignal() === DialogType.Login}>
            <Login client={props.client} />
          </Match>
          <Match when={props.client.dialogTypeSignal() === DialogType.CreateUser}>
            <CreateUser client={props.client} />
          </Match>
          <Match when={props.client.dialogTypeSignal() === DialogType.Logout}>
            <Logout client={props.client} />
          </Match>
          <Match when={props.client.dialogTypeSignal() === DialogType.Settings}>
            <Settings client={props.client} />
          </Match>
        </Switch>
      </div>
    </Show>
  );
}

export enum DialogType {
  Login,
  CreateUser,
  Logout,
  Settings,
}

const dialogTypeToTitle = new Map([
  [DialogType.Login, 'Login'],
  [DialogType.CreateUser, 'Create User'],
  [DialogType.Logout, 'Logout'],
  [DialogType.Settings, 'Settings'],
]);
