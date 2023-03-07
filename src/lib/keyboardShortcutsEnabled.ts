import { derived } from 'svelte/store';
import { settingsDialogIsVisible } from './Settings.svelte';

export const keyboardShortcutsEnabled = derived(
	settingsDialogIsVisible,
	($settingsDialogIsVisible) => !$settingsDialogIsVisible,
);
