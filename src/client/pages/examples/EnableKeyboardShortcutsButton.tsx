import { createContext, createEffect, createSelector, createSignal, useContext } from 'solid-js';

export function EnableKeyboardShortcutsButton(props: {
  onChangeEnabled: (enabled: boolean) => void;
}) {
  const context = useEnableKeyboardShortcutsButtonContext();

  if (!context) {
    throw new Error('missing context');
  }

  const myId = context.nextId();

  createEffect(() => {
    props.onChangeEnabled(context.isIdEnabled(myId));
  });

  return (
    <input
      type="button"
      value={context.isIdEnabled(myId) ? 'Keyboard Shortcuts Enabled' : 'Enable Keyboard Shortcuts'}
      onClick={() => context.setOnlyEnabledId((id) => (id === myId ? 0 : myId))}
    />
  );
}

export function makeEnableKeyboardShortcutsButtonContext() {
  let nextId = 0;
  const [onlyEnabledId, setOnlyEnabledId] = createSignal(nextId++);
  const isIdEnabled = createSelector(onlyEnabledId);

  return {
    nextId() {
      return nextId++;
    },
    setOnlyEnabledId,
    isIdEnabled,
  };
}

type EnableKeyboardShortcutsButtonContextType = ReturnType<
  typeof makeEnableKeyboardShortcutsButtonContext
>;

export const EnableKeyboardShortcutsButtonContext =
  createContext<EnableKeyboardShortcutsButtonContextType>();

const useEnableKeyboardShortcutsButtonContext = () =>
  useContext(EnableKeyboardShortcutsButtonContext);
