let nextRegistrationKey = 0;

export function registerKeyboardShortcuts(keyboardShortcuts: { [key: string]: () => void }): () => void {
    const registrationKey = nextRegistrationKey.toString(36);
    nextRegistrationKey++;

    allRegisteredKeyboardShortcuts[registrationKey] = keyboardShortcuts;

    return unregisterKeyboardShortcuts.bind(null, registrationKey);
}

function unregisterKeyboardShortcuts(registrationKey: string) {
    delete allRegisteredKeyboardShortcuts[registrationKey];
}

const allRegisteredKeyboardShortcuts: { [key: string]: { [key: string]: () => void } } = {};

document.addEventListener('keydown', event => {
    const keyName = event.key;

    for (const registrationKey in allRegisteredKeyboardShortcuts) {
        if (allRegisteredKeyboardShortcuts.hasOwnProperty(registrationKey)) {
            const keyboardShortcuts = allRegisteredKeyboardShortcuts[registrationKey];

            if (keyboardShortcuts.hasOwnProperty(keyName)) {
                keyboardShortcuts[keyName]();
            }
        }
    }
});
