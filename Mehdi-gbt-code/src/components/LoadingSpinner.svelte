<script lang="ts">
	export let isLoading = false;
</script>

{#if isLoading}
	<div class="py-8 flex flex-col items-center justify-center">
		<div class="relative">
			<svg
				class="animate-spin h-16 w-16 text-blue-500"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
			</div>
		</div>
		<p class="mt-4 text-gray-600 font-medium animate-pulse">Processing your request...</p>
	</div>
{/if}
