import { createEffect, createSelector, createSignal } from 'solid-js';

let nextID = 0;
const [onlyEnabledID, setOnlyEnabledID] = createSignal(nextID++);
const isIDEnabled = createSelector(onlyEnabledID);

export function EnableKeyboardShortcutsButton(props: {
  onChangeEnabled: (enabled: boolean) => void;
}) {
  const myID = nextID++;

  createEffect(() => {
    props.onChangeEnabled(isIDEnabled(myID));
  });

  return (
    <input
      type="button"
      value={isIDEnabled(myID) ? 'Keyboard Shortcuts Enabled' : 'Enable Keyboard Shortcuts'}
      onClick={() => setOnlyEnabledID((id) => (id === myID ? 0 : myID))}
    />
  );
}
