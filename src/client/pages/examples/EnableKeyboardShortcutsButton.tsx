import { createEffect, createSelector, createSignal } from 'solid-js';

let nextId = 0;
const [onlyEnabledId, setOnlyEnabledId] = createSignal(nextId++);
const isIdEnabled = createSelector(onlyEnabledId);

export function EnableKeyboardShortcutsButton(props: {
  onChangeEnabled: (enabled: boolean) => void;
}) {
  const myId = nextId++;

  createEffect(() => {
    props.onChangeEnabled(isIdEnabled(myId));
  });

  return (
    <input
      type="button"
      value={isIdEnabled(myId) ? 'Keyboard Shortcuts Enabled' : 'Enable Keyboard Shortcuts'}
      onClick={() => setOnlyEnabledId((id) => (id === myId ? 0 : myId))}
    />
  );
}
