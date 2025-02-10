import { createMemo, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { type Client } from '../client';
import { DialogType } from '../helpers';
import { type ProcessMyKeyboardEventRef } from '../myKeyboardEvents';
import { CreateUser } from './CreateUser';
import styles from './Dialog.module.css';
import { Login } from './Login';
import { Logout } from './Logout';
import { Settings } from './Settings';

export function Dialog(props: { ref: (ref: ProcessMyKeyboardEventRef) => void; client: Client }) {
  let rootElement!: HTMLDivElement;

  const earliestTimeToCloseByClickingOutside = createMemo(() =>
    props.client.signals.dialogType() !== undefined ? Date.now() + 100 : 0,
  );

  function onClickSomewhere(event: MouseEvent) {
    if (
      props.client.signals.dialogType() !== undefined &&
      event.target instanceof Node &&
      !rootElement.contains(event.target) &&
      Date.now() >= earliestTimeToCloseByClickingOutside()
    ) {
      close();
    }
  }
  // eslint-disable-next-line solid/reactivity
  addEventListener('click', onClickSomewhere);
  onCleanup(() => removeEventListener('click', onClickSomewhere));

  onMount(() => {
    props.ref({
      processMyKeyboardEvent: (myKeyboardEvent) => {
        if (myKeyboardEvent.code === 'Escape' && myKeyboardEvent.modifiers === 0) {
          close();
        }
      },
    });
  });

  function close() {
    props.client.setDialogType(undefined);
  }

  return (
    <Show when={props.client.signals.dialogType() !== undefined}>
      <div class={styles.root} ref={rootElement}>
        <div class={styles.header}>
          <span class={styles.title}>
            {dialogTypeToTitle.get(props.client.signals.dialogType()!)}
          </span>
          <span class={styles.close} onClick={close}>
            &nbsp;x&nbsp;
          </span>
        </div>
        <Switch>
          <Match when={props.client.signals.dialogType() === DialogType.Login}>
            <Login client={props.client} />
          </Match>
          <Match when={props.client.signals.dialogType() === DialogType.CreateUser}>
            <CreateUser client={props.client} />
          </Match>
          <Match when={props.client.signals.dialogType() === DialogType.Logout}>
            <Logout client={props.client} />
          </Match>
          <Match when={props.client.signals.dialogType() === DialogType.Settings}>
            <Settings client={props.client} />
          </Match>
        </Switch>
      </div>
    </Show>
  );
}

const dialogTypeToTitle = new Map([
  [DialogType.Login, 'Login'],
  [DialogType.CreateUser, 'Create User'],
  [DialogType.Logout, 'Logout'],
  [DialogType.Settings, 'Settings'],
]);
