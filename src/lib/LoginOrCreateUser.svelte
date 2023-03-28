<script lang="ts" context="module">
	abstract class BaseStuff {
		abstract submitButtonTitle: string;
		abstract otherIntro: string;
		abstract otherTitle: string;

		username = '';
		usernameError = '';
		password = '';
		passwordError = '';
		confirmPassword = '';
		confirmPasswordError = '';

		constructor(public client: Client) {}

		abstract validateUsername(): void;
		abstract validatePassword(): void;
		validateConfirmPassword() {}

		validateAll() {
			this.validateUsername();
			this.validatePassword();
			this.validateConfirmPassword();
		}

		isValid() {
			return !this.usernameError && !this.passwordError && !this.confirmPasswordError;
		}

		submit() {}
	}

	class LoginStuff extends BaseStuff {
		submitButtonTitle = 'Login';
		otherIntro = 'If you have not created a user:';
		otherTitle = 'Create User';

		validateUsername() {
			this.username = this.username.replace(/\s+/g, ' ').trim();
			if (this.username.length > 0) {
				this.usernameError = '';
			} else {
				this.usernameError = 'Username is required.';
			}
		}

		validatePassword() {
			if (this.password.length > 0) {
				this.passwordError = '';
			} else {
				this.passwordError = 'Password is required.';
			}
		}

		submit() {
			this.client.loginWithPassword(this.username, this.password);
			super.submit();
		}
	}

	class CreateUserStuff extends BaseStuff {
		submitButtonTitle = 'Create User';
		otherIntro = 'If you already created a user:';
		otherTitle = 'Login';

		validateUsername() {
			this.username = this.username.replace(/\s+/g, ' ').trim();
			if (isValidUsername(this.username)) {
				this.usernameError = '';
			} else {
				this.usernameError = 'Username must have between 1 and 32 ASCII characters.';
			}
		}

		validatePassword() {
			if (isValidPassword(this.password)) {
				this.passwordError = '';
			} else {
				this.passwordError = 'Password must have at least 8 characters.';
			}
		}

		validateConfirmPassword() {
			if (this.confirmPassword === this.password) {
				this.confirmPasswordError = '';
			} else {
				this.confirmPasswordError = 'Passwords must match.';
			}
		}

		submit() {
			this.client.createUserAndLogin(this.username, this.password);
			super.submit();
		}
	}
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { isValidPassword, isValidUsername } from '../common/helpers';
	import type { Client } from './client';

	export let loginMode: boolean;
	export let onSwitch: () => void;

	const client: Client = getContext('client');

	let stuff: BaseStuff = loginMode ? new LoginStuff(client) : new CreateUserStuff(client);
</script>

<form
	on:submit={(event) => {
		event.preventDefault();

		stuff.validateAll();

		if (stuff.isValid()) {
			stuff.submit();
		}

		stuff = stuff;
	}}
>
	<div>
		<label>
			Username:
			<input
				class:error={stuff.usernameError}
				type="text"
				bind:value={stuff.username}
				on:blur={() => {
					stuff.validateUsername();
					stuff = stuff;
				}}
			/>
		</label>
		<div class="error">{stuff.usernameError}</div>
	</div>
	<div>
		<label>
			Password:
			<input
				class:error={stuff.passwordError}
				type="password"
				bind:value={stuff.password}
				on:blur={() => {
					stuff.validatePassword();
					stuff = stuff;
				}}
			/>
		</label>
		<div class="error">{stuff.passwordError}</div>
	</div>
	{#if stuff instanceof CreateUserStuff}
		<div>
			<label>
				Confirm Password:
				<input
					class:error={stuff.confirmPasswordError}
					type="password"
					bind:value={stuff.confirmPassword}
					on:blur={() => {
						stuff.validateConfirmPassword();
						stuff = stuff;
					}}
				/>
			</label>
			<div class="error">{stuff.confirmPasswordError}</div>
		</div>
	{/if}
	<div>
		<button type="submit">{stuff.submitButtonTitle}</button>
	</div>
</form>

<hr />

<div>
	{stuff.otherIntro}
	<button on:click={onSwitch}>
		{stuff.otherTitle}
	</button>
</div>

<style>
	div {
		margin-top: 8px;
	}

	hr {
		margin: 1em 0;
	}

	input.error {
		border-color: red;
		border-style: solid;
	}

	div.error {
		color: red;
	}
</style>
