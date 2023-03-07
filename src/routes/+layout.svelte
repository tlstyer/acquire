<script>
	import Header from '$lib/Header.svelte';
	import 'normalize.css';
	import './global.css';
</script>

<Header />
<div><slot /></div>

<style>
	:root {
		background-color: var(--main-background-color);
		color: #000000;
		font-family: sans-serif;
		font-size: 16px;

		--border-color: #f6f4f2;

		--main-background-color-netacquire: #f6f4f2;
		--main-background-color-white: white;
		--main-background-color: var(--main-background-color-netacquire);

		--scrolling-div-background-color-netacquire: #c0c0ff;
		--scrolling-div-background-color-white: white;
		--scrolling-div-background-color: var(--scrolling-div-background-color-netacquire);

		--header-height: 20px;
	}

	div {
		padding-top: var(--header-height);
	}
</style>
