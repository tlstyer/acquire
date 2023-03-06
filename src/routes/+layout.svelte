<script>
	import Header from '$lib/Header.svelte';
	import 'normalize.css';
	import './global.css';
</script>

<div class="root">
	<Header />
	<div class="content"><slot /></div>
</div>

<style>
	.root {
		--header-height: 20px;
	}

	.content {
		padding-top: var(--header-height);
	}
</style>
