<script lang="ts">
	import { onMount } from 'svelte';
	
	let sidebarOpen = true;
	
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
	
	function newChat() {
		// Reset chat functionality would go here
		window.location.reload();
	}
	
	onMount(() => {
		// Close sidebar on mobile by default
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			sidebarOpen = false;
		}
	});
</script>

{#if sidebarOpen}
	<aside class="fixed left-0 top-0 h-full w-64 bg-black text-white flex flex-col z-40 border-r border-gray-800 md:relative md:z-auto">
		<div class="p-4 border-b border-gray-800">
			<div class="flex items-center gap-2 mb-4">
				<button
					on:click={toggleSidebar}
					class="md:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<h2 class="text-lg font-semibold text-white">Mehdi GPT</h2>
			</div>
			<button 
				on:click={newChat}
				class="w-full px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Chat
			</button>
		</div>
		
		<div class="flex-1 overflow-y-auto p-2">
			<div class="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider font-medium">Recent</div>
			<!-- Chat history would go here -->
		</div>
		
		<div class="p-4 border-t border-gray-800">
			<div class="flex items-center gap-3 p-2 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors">
				<div class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
					<span class="text-sm font-semibold">M</span>
				</div>
				<span class="text-sm font-medium text-white">Mehdi</span>
			</div>
		</div>
	</aside>
{/if}

{#if !sidebarOpen}
	<button
		on:click={toggleSidebar}
		class="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors shadow-lg border border-gray-800 md:hidden"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</button>
{/if}
