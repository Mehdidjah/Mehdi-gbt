<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let ROUTES: string[] = [];
	export let selectedRouteIndex = 0;

	const dispatch = createEventDispatcher();

	function handleChange(event: any) {
		selectedRouteIndex = parseInt(event.target.value);
		dispatch('change', selectedRouteIndex);
	}
</script>

<div class="flex items-center gap-2">
	<label for="routeSelect" class="text-sm font-semibold text-gray-700">API Route:</label>
	<select
		class="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
		id="routeSelect"
		bind:value={selectedRouteIndex}
		on:change={handleChange}
	>
		{#each ROUTES as route, index}
			<option value={index} class="font-mono">{route}</option>
		{/each}
	</select>
</div>
