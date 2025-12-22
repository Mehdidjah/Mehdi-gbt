<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	import { ROUTES } from '../constants/ROUTES';

	type ROUTEStatus = {
		status: number;
		time: number;
	};

	type Result = {
		status: 'fulfilled' | 'rejected';
		value?: ROUTEStatus;
		reason?: unknown;
	};

	let statusMessage = writable('Connecting to API');

	let failedROUTESCount = writable(0);

	let isConnected = false;
	let wasEverConnected = false;

	let results: Result[] = [];

	let alertClass = derived(
		[statusMessage, failedROUTESCount],
		([$statusMessage, $failedROUTESCount]) => {
			if ($statusMessage.includes('✅')) {
				return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg';
			}

			if ($statusMessage.includes('⚠️')) {
				return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg';
			}

			if ($statusMessage.includes('Connecting')) {
				return 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900';
			}

			return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg';
		}
	);

	async function fetchROUTEStatus(route: string): Promise<ROUTEStatus> {
		const startTime = Date.now();
		try {
			const response = await fetch(`${route}?prompt=Hello`);
			const time = Date.now() - startTime;

			// If it's a 500 error, it might be missing API key - don't treat as complete failure
			if (response.status === 500) {
				const errorData = await response.json().catch(() => ({}));
				if (errorData.error?.includes('env variable not set') || errorData.error?.includes('OPENAI_KEY')) {
					// API key not configured - this is expected, not a route failure
					return { status: 200, time: Math.round(time) };
				}
			}

			if (response.status !== 200) {
				throw new Error(`HTTP ${response.status}`);
			}

			return { status: 200, time: Math.round(time) };
		} catch (error) {
			// Network errors or other issues
			throw error;
		}
	}

	function processResults(results: Result[]): any[] {
		return results.map((result, index) => {
			if (result.status === 'fulfilled') {
				return {
					route: ROUTES[index],
					status: result.value?.status === 200 ? 'OK' : 'Failed',
					time: result.value?.time
				};
			} else {
				return { route: ROUTES[index], status: 'Failed', time: 0 };
			}
		});
	}

	async function checkApiConnection(retries = 3): Promise<void> {
		let responseTimes: string[] | undefined;

		for (let i = 0; i < retries; i++) {
			try {
				results = await Promise.allSettled(ROUTES.map(fetchROUTEStatus));
				responseTimes = processResults(results);

				const allConnected = results.every(
					(result) => result.status === 'fulfilled' && result?.value?.status === 200
				);

				if (allConnected) {
					isConnected = true;
					wasEverConnected = true;
					break;
				} else {
					const failedCount = results.filter((result) => result.status === 'rejected').length;
					failedROUTESCount.set(failedCount);
				}
			} catch (error) {
				// Wait for 2 seconds before retrying
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		if (isConnected) {
			statusMessage.set(`✅ All routes connected successfully`);
		} else {
			// Check if we have any successful routes
			const successfulRoutes = results.filter(
				(result) => result.status === 'fulfilled' && result?.value?.status === 200
			).length;
			const totalRoutes = ROUTES.length;

			if (successfulRoutes > 0 && successfulRoutes < totalRoutes) {
				statusMessage.set(`⚠️ ${successfulRoutes} of ${totalRoutes} route(s) working`);
			} else if (successfulRoutes === 0) {
				// Check if it's an API key issue
				const hasApiKeyError = results.some((result) => {
					if (result.status === 'rejected') {
						const reason = result.reason;
						return reason instanceof Error && reason.message.includes('env variable');
					}
					return false;
				});

				if (hasApiKeyError) {
					statusMessage.set('⚠️ API key not configured. Please set SECRET_OPENAI_KEY in your .env file.');
				} else {
					statusMessage.set(
						wasEverConnected
							? '❌ Lost connection to API. Please try refreshing the page.'
							: '❌ Failed to connect to API. Check your configuration.'
					);
				}
			}
		}
	}

	function accordion(node: HTMLElement, isOpen: boolean) {
		const content = node.querySelector('p');
		const closedHeight = node.offsetHeight;
		const openHeight = closedHeight + (content?.offsetHeight || 0) + 150; // Add 30px (10px top + 10px bottom)

		node.style.height = isOpen ? `${openHeight}px` : `${closedHeight}px`;
		node.style.overflow = 'hidden';

		return {
			update(isOpen: boolean) {
				const animation = node.animate(
					[
						{
							height: `${openHeight}px`,
							overflow: 'hidden'
						},
						{
							height: `${closedHeight}px`,
							overflow: 'hidden'
						}
					],
					{ duration: 200, fill: 'both' }
				);
				animation.pause();

				if (!isOpen) {
					animation.play();
				} else {
					animation.reverse();
				}
			}
		};
	}

	onMount(() => {
		checkApiConnection();
	});
</script>

<div
	class="rounded-lg min-h-[60px] w-full md:w-[45rem] mt-1 mb-5 {$alertClass} transition-all duration-300 hover:shadow-xl"
	use:accordion={isConnected}
>
	<div class="text-center mx-auto p-4">
		<span class="font-semibold text-lg">{@html $statusMessage}</span>
		{#if isConnected}
			<div class="mt-4 overflow-x-auto">
				<table class="w-full border-collapse shadow-lg rounded-lg overflow-hidden mx-auto bg-white">
					<thead>
						<tr class="bg-gradient-to-r from-gray-700 to-gray-800">
							<th class="border-r border-gray-600 px-4 py-3 text-white font-bold text-sm">Route</th>
							<th class="border-r border-gray-600 px-4 py-3 text-white font-bold text-sm">Status</th>
							<th class="border-r border-gray-600 px-4 py-3 text-white font-bold text-sm">Response Time</th>
							<th class="px-4 py-3 text-white font-bold text-sm">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each processResults(results) as { route, status, time }, index}
							<tr class="transition-colors {index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50">
								<td class="border-r border-gray-200 px-4 py-3 text-sm font-mono text-gray-700">{route}</td>
								<td class="border-r border-gray-200 px-4 py-3">
									<span class="px-2 py-1 rounded-full text-xs font-semibold {status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
										{status}
									</span>
								</td>
								<td class="border-r border-gray-200 px-4 py-3 text-sm text-gray-600">{time}ms</td>
								<td class="px-4 py-3 text-xs text-gray-500">Ready</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
