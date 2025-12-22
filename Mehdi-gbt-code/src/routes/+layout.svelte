<script>
	import Footer from '$components/Footer.svelte';
	import Toast from '$components/Toast.svelte';

	import '../app.postcss'; // KEEP THIS!
</script>

<div class="min-h-screen flex flex-col bg-black">
	<main class="flex-1">
		<slot />
	</main>

	<Toast />
</div>
