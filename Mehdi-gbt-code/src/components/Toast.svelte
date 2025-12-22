<script lang="ts">
	import { toastStore } from '$lib/toast';

	function variantClasses(variant: string) {
		switch (variant) {
			case 'success':
				return 'bg-emerald-600 text-white';
			case 'error':
				return 'bg-red-600 text-white';
			default:
				return 'bg-slate-900 text-white';
		}
	}
</script>

<div class="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
	<div class="mx-auto w-full max-w-lg px-4 space-y-2">
		{#each $toastStore as t (t.id)}
			<div
				class={`pointer-events-auto shadow-lg rounded px-4 py-3 text-sm flex items-start justify-between gap-3 ${variantClasses(
					t.variant
				)}`}
			>
				<div class="flex-1">{t.message}</div>
				<button
					class="opacity-90 hover:opacity-100 font-semibold"
					type="button"
					on:click={() => toastStore.remove(t.id)}
					aria-label="Dismiss"
				>
					×
				</button>
			</div>
		{/each}
	</div>
</div>


