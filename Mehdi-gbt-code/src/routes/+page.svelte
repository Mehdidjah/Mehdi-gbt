<script lang="ts">
	import MessageBubble from '$components/MessageBubble.svelte';
	import Sidebar from '$components/Sidebar.svelte';

	import textStore from '$store/store';
	import { addQuestionAndAssociateOutput } from '$store/storeHelpers';

	import { ROUTES } from '../constants/ROUTES';

	let selectedRouteIndex = 0;
	let isLoading = false;
	let messages: Array<{ role: 'user' | 'assistant'; content: string[] }> = [];
	let errorMessage = '';

	$: isDisabled = $textStore.inputText.length === 0 || isLoading;

	async function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleSubmit(selectedRouteIndex);
	}

	async function handlePrimaryRoute(routeIndex = 0) {
		const inputText = $textStore.inputText;
		
		// Add user message
		messages = [...messages, { role: 'user' as const, content: [inputText] }];
		
		// Add assistant message placeholder
		const assistantMessageIndex = messages.length;
		messages = [...messages, { role: 'assistant' as const, content: [] }];

		// Encode your parameters
		const params = new URLSearchParams({
			prompt: inputText,
			conversation_id: $textStore.conversationId
		});

		const eventSource = new EventSource(`${ROUTES[routeIndex]}?${params.toString()}`);

		eventSource.addEventListener('error', (event) => {
			console.error('EventSource error:', event);
			isLoading = false;
			eventSource.close();
			errorMessage = 'Failed to connect to API. Please check your API key.';
		});

		eventSource.addEventListener('end', () => {
			isLoading = false;
			eventSource.close();
			errorMessage = '';
			
			const questions = $textStore.questions;
			let questionId = questions.length + 1;
			addQuestionAndAssociateOutput(questionId, $textStore.outputText, ROUTES[routeIndex]);

			textStore.update((text) => {
				return {
					...text,
					inputText: '',
					outputText: []
				};
			});
		});

		eventSource.addEventListener('message', (event) => {
			errorMessage = ''; // Clear any previous errors
			
			let completionResponse;
			let delta: { content: string };

			try {
				// Check if it's an error message
				if (event.data.includes('"error"')) {
					const errorData = JSON.parse(event.data);
					if (errorData.error) {
						errorMessage = errorData.error;
						isLoading = false;
						eventSource.close();
						return;
					}
				}

				completionResponse = JSON.parse(event.data);
				delta = completionResponse.choices[0]?.delta;
			} catch {
				// Ignore non-JSON data like '[DONE]'
				if (event.data === '[DONE]') {
					isLoading = false;
					eventSource.close();
					
					const questions = $textStore.questions;
					let questionId = questions.length + 1;
					addQuestionAndAssociateOutput(questionId, $textStore.outputText, ROUTES[routeIndex]);

					textStore.update((text) => {
						return {
							...text,
							inputText: '',
							outputText: []
						};
					});
					return;
				}
				return;
			}

			// Update the assistant message in real-time
			if (delta?.content) {
				messages[assistantMessageIndex].content = [...messages[assistantMessageIndex].content, delta.content];
				messages = messages; // Trigger reactivity
			}

			textStore.update((text) => {
				return {
					...text,
					outputText: [...text.outputText, delta.content]
				};
			});
		});
	}

	async function handleNonPrimaryRoute(routeIndex: number) {
		const inputText = $textStore.inputText;
		
		// Add user message
		messages = [...messages, { role: 'user' as const, content: [inputText] }];
		const assistantMessageIndex = messages.length;
		messages = [...messages, { role: 'assistant' as const, content: [] }];

		// Encode your parameters
		const params = new URLSearchParams({
			prompt: inputText,
			conversation_id: $textStore.conversationId
		});

		const response = await fetch(`${ROUTES[routeIndex]}?${params.toString()}`);
		const data = await response.json();

		// Update assistant message
		messages[assistantMessageIndex].content = [String(data)];
		messages = messages;

		const questions = $textStore.questions;
		let questionId = questions.length + 1;
		addQuestionAndAssociateOutput(questionId, data, ROUTES[routeIndex]);

		textStore.update((text) => {
			return {
				...text,
				inputText: '',
				outputText: []
			};
		});

		isLoading = false;
	}

	async function handleSubmit(routeIndex = 0) {
		if (isDisabled) return;
		isLoading = true;

		if (routeIndex === 0) {
			await handlePrimaryRoute(routeIndex);
		} else {
			await handleNonPrimaryRoute(routeIndex);
		}
	}
	
	function scrollToBottom() {
		setTimeout(() => {
			const chatContainer = document.getElementById('chat-container');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}
	
	$: if (messages.length > 0) scrollToBottom();
</script>

<svelte:head>
	<title>Mehdi GPT</title>
</svelte:head>

<div class="flex h-screen bg-black text-white overflow-hidden">
	<Sidebar />
	
	<div class="flex-1 flex flex-col overflow-hidden bg-black">
		<!-- Header -->
		<header class="border-b border-gray-800 px-6 py-4 bg-black">
			<h1 class="text-lg font-semibold text-white">Mehdi GPT</h1>
		</header>
		
		<!-- Chat Messages Area -->
		<div id="chat-container" class="flex-1 overflow-y-auto bg-black">
			{#if errorMessage}
				<div class="max-w-3xl mx-auto px-4 py-6">
					<div class="bg-red-900/20 border border-red-800 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div class="flex-1">
								<h3 class="text-red-400 font-semibold mb-1">API Error</h3>
								<p class="text-red-300 text-sm">{errorMessage}</p>
								{#if errorMessage.includes('API key') || errorMessage.includes('env variable') || errorMessage.includes('Invalid API key') || errorMessage.includes('Incorrect API key')}
									<div class="mt-3 text-xs text-gray-400">
										<p class="mb-2 font-semibold text-gray-300">To fix this:</p>
										<ol class="list-decimal list-inside space-y-2 mb-3">
											<li>Get a real API key from <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-400 hover:text-blue-300 underline">OpenAI Platform</a></li>
											<li>Update your <code class="bg-gray-800 px-1 py-0.5 rounded">.env</code> file with: <code class="bg-gray-800 px-1 py-0.5 rounded">SECRET_OPENAI_KEY="sk-your-real-key"</code></li>
											<li>Restart the dev server (Ctrl+C then <code class="bg-gray-800 px-1 py-0.5 rounded">npm run dev</code>)</li>
										</ol>
										<p class="text-red-400 text-xs mt-2">⚠️ Keys from GitHub repos are usually fake examples and won't work!</p>
									</div>
								{:else if errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')}
									<div class="mt-3 text-xs text-gray-400">
										<p class="text-red-400">Your OpenAI account needs billing setup or has run out of credits.</p>
										<p class="mt-2">Visit <a href="https://platform.openai.com/account/billing" target="_blank" class="text-blue-400 hover:text-blue-300 underline">OpenAI Billing</a> to add credits.</p>
									</div>
								{/if}
							</div>
							<button
								on:click={() => errorMessage = ''}
								class="text-gray-400 hover:text-white transition-colors"
								aria-label="Close error"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/if}
			
			{#if messages.length === 0 && !errorMessage}
				<div class="flex flex-col items-center justify-center h-full px-4">
					<div class="text-center max-w-2xl">
						<h1 class="text-5xl font-bold mb-6 text-white">Mehdi GPT</h1>
						<p class="text-gray-400 text-xl mb-12">How can I help you today?</p>
					</div>
				</div>
			{:else if messages.length > 0}
				{#each messages as message, index}
					<MessageBubble 
						role={message.role} 
						content={message.content}
						isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
					/>
				{/each}
			{/if}
		</div>
		
		<!-- Input Area -->
		<div class="border-t border-gray-800 bg-black">
			<div class="max-w-3xl mx-auto px-4 py-4">
				<form on:submit|preventDefault={handleFormSubmit} class="relative">
					<div class="relative flex items-end bg-black rounded-2xl border border-gray-700 focus-within:border-gray-600 transition-colors">
						<textarea
							id="gptChatBox"
							bind:value={$textStore.inputText}
							placeholder="Message Mehdi GPT..."
							disabled={isLoading}
							rows="1"
							class="w-full bg-transparent text-white placeholder-gray-500 resize-none px-4 py-3 pr-12 focus:outline-none max-h-52 overflow-y-auto"
							on:input={(e) => {
								const target = e.target as HTMLTextAreaElement;
								target.style.height = 'auto';
								target.style.height = `${Math.min(target.scrollHeight, 208)}px`;
							}}
							on:keydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(selectedRouteIndex);
								}
							}}
						></textarea>
						<button
							type="submit"
							disabled={isDisabled}
							aria-label="Send message"
							class="absolute right-2 bottom-2 p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						</button>
					</div>
					<div class="mt-2 text-xs text-gray-500 text-center">
						Mehdi GPT can make mistakes. Check important info.
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
