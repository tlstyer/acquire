import { Accessor, createEffect, createSignal, on } from 'solid-js';
import { isServer } from 'solid-js/web';

export const KEY_ALT = 1;
export const KEY_CTRL = 2;
export const KEY_META = 4;
export const KEY_SHIFT = 8;

export class MyKeyboardEvent {
  constructor(
    public modifiers: number,
    public code: string,
  ) {}
}

const dummyMyKeyboardEvent = new MyKeyboardEvent(0, '');

const [browserMyKeyboardEvent, setBrowserMyKeyboardEvent] = createSignal(dummyMyKeyboardEvent, {
  equals: false,
});

if (!isServer) {
  window.addEventListener('keydown', (e) => {
    setBrowserMyKeyboardEvent(
      new MyKeyboardEvent(
        (e.altKey ? KEY_ALT : 0) +
          (e.ctrlKey ? KEY_CTRL : 0) +
          (e.metaKey ? KEY_META : 0) +
          (e.shiftKey ? KEY_SHIFT : 0),
        e.code,
      ),
    );
  });
}

export type ProcessMyKeyboardEventRef = {
  processMyKeyboardEvent: (myKeyboardEvent: MyKeyboardEvent) => void;
};

export function processBrowserMyKeyboardEvents(
  keyboardShortcutsEnabled: Accessor<boolean>,
  myKeyboardEventRef: ProcessMyKeyboardEventRef,
) {
  createEffect(() => {
    if (keyboardShortcutsEnabled()) {
      let initialized = false;
      createEffect(
        on(browserMyKeyboardEvent, (myKeyboardEvent) => {
          if (initialized) {
            myKeyboardEventRef.processMyKeyboardEvent(myKeyboardEvent);
          }
          initialized = true;
        }),
      );
    }
  });
}
