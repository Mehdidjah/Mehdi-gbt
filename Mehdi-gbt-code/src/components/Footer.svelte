<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<footer aria-label="Footer content with copyright">
	<div class="mt-10 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-lg">
		<div class="flex flex-col items-center justify-center w-full p-6 text-white">
			<div class="flex items-center gap-2 font-semibold text-sm md:text-base">
				<span>© {new Date().getFullYear()}</span>
				<span class="text-blue-400 font-bold">Mehdi</span>
				<span>All rights reserved</span>
			</div>
			<p class="mt-2 text-xs text-gray-400">Built with SvelteKit & OpenAI</p>
		</div>
	</div>
</footer>
