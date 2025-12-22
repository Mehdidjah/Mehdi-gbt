<script lang="ts">
	export let id = '';
	export let value = '';
	let characterCount = 0; // Initialize character count
	export let placeholder = '';
	export let isLoading = false;
	export let onInput = () => {};
	export let handleSubmit = () => {};

	// Update character count whenever the value changes
	$: characterCount = value.length;

	function handleKeyPress(event: { key: string }) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="textarea-container">
	<textarea
		{id}
		maxlength="19000"
		class="w-full md:w-[45rem] h-[18rem] md:h-[25rem] border-2 border-gray-300 rounded-lg p-4 bg-white shadow-md mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-sans text-gray-700 placeholder-gray-400"
		disabled={isLoading}
		bind:value
		{placeholder}
		on:input={onInput}
		on:keypress={handleKeyPress}
	></textarea>

	<span class="character-counter">
		<span class="text-xs {characterCount > 18000 ? 'text-red-500 font-semibold' : 'text-gray-500'}">
			{characterCount.toLocaleString()} / 19,000
		</span>
	</span>
</div>

<style>
	/* Additional styles to place the character counter in the bottom right corner */
	.character-counter {
		position: absolute;
		bottom: 1.5rem;
		right: 1rem;
		font-size: 0.875rem;
		color: #2e2e2e7e;
	}

	.textarea-container {
		position: relative;
	}
</style>
