<svelte:options immutable />

<div>
	<span class="name">Acquire</span>
	<span class="middle" />
	<span>⚙</span>
</div>

<style>
	div {
		position: fixed;
		top: 0;
		left: 0;
		height: var(--header-height);
		width: 100%;
		padding: 2px;
		background-color: #e6e6e6;

		display: flex;
		flex-direction: row;
	}

	span:nth-last-child(n + 2) {
		margin-right: 8px;
	}

	.name {
		font-weight: bold;
	}

	.middle {
		flex-grow: 1;
		cursor: initial;
	}
</style>
