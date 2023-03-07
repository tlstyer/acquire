<svelte:options immutable />

<script lang="ts">
	export const show = () => dialog?.showModal();

	let dialog: HTMLDialogElement | null = null;

	function onClick(event: MouseEvent) {
		if (dialog) {
			const rect = dialog.getBoundingClientRect();
			const isInDialog =
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width;
			if (!isInDialog) {
				dialog.close();
			}
		}
	}
</script>

<dialog bind:this={dialog} on:click={onClick} on:keydown={undefined}>
	<h3>Settings</h3>
	<button on:click={() => dialog?.close()}>Close</button>
</dialog>
