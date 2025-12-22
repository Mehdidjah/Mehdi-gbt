<script lang="ts">
	/**
	 * Customizable button that allows the user to define its action, type, and width.
	 */
	import type { MouseEventHandler } from 'svelte/elements';

	export let buttonType = 'filled';
	export let isDisabled = false;
	export let buttonWidth = '10rem';
	export let buttonAction: MouseEventHandler<HTMLButtonElement> | undefined = undefined;

	function typeClasses(type: string) {
		switch (type) {
			case 'filled-secondary':
				return 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg';
			case 'filled':
			default:
				return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg';
		}
	}
</script>

<button
	type="submit"
	class={`py-2.5 px-6 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${typeClasses(
		buttonType
	)}`}
	style={`width:${buttonWidth};`}
	disabled={isDisabled}
	on:click={buttonAction ? buttonAction : () => {}}
>
	<slot />
</button>
