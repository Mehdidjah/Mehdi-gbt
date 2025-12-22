<script lang="ts">
	/**
	 * This Svelte component is designed to display and interact with completion data from a model.
	 * It includes features like copying the completion data to the clipboard and highlighting code blocks within the data.
	 *
	 */
	interface Delta {
		role: string;
		content: string;
	}

	interface Choice {
		index: number;
		finish_reason?: string;
		delta: Delta;
	}

	interface Completion {
		choices: Choice[];
		created: number;
		id: string;
		model: string;
		object: string;
	}

	type CompletionsArray = Completion[];

	import { Marked } from 'marked';

	import { onMount } from 'svelte';

	import { markedHighlight } from 'marked-highlight';

	import { writable } from 'svelte/store';
	import { fly, fade } from 'svelte/transition';
	import CodeBlock from '$components/CodeBlock.svelte';
	import { toastStore } from '$lib/toast';

	import { processTextAndCodeBlocks } from '$utils/functions/functions';

	import hljs from 'highlight.js/lib/core';

	// Import each language module you require
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import shell from 'highlight.js/lib/languages/shell';
	import php from 'highlight.js/lib/languages/php';
	import bash from 'highlight.js/lib/languages/bash';

	// Register each imported language module
	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('php', php);
	hljs.registerLanguage('bash', bash);

	import 'highlight.js/styles/github-dark.css';

	import Button from './Button.svelte';

	export let data: CompletionsArray = [];
	export let routeName: string;

	const content = writable<CompletionsArray>();

	let parsedData: string | Promise<string>;

	$: {
		content.set(data);
	}

	onMount(() => {
		const marked = new Marked(
			markedHighlight({
				langPrefix: 'hljs language-',
				highlight(code, lang) {
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';

					const highlightedCode = hljs.highlight(code, { language }).value;

					// Add inline styles to the pre and code elements
					return `<div style="margin-top: 10px; margin-bottom: 10px; padding: 15px; border-radius: 5px; color: #fff; background-color: #282c34; font-size: 14px">${highlightedCode}</div>`;
				}
			})
		);

		parsedData = marked.parse(data.toString());
	});

	async function copyToClipboard() {
		try {
			const concatenatedContent = $content.map((item) => item).join('');

			await navigator.clipboard.writeText(concatenatedContent);

			toastStore.push('Content copied to clipboard', { variant: 'success', timeoutMs: 6000 });
		} catch (err) {
			toastStore.push('Error copying data to clipboard', { variant: 'error', timeoutMs: 6000 });
		}
	}
</script>

<div class="w-full sm:w-auto" data-testid="ai-response-container">
	<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
		<div class="border-2 border-gray-200 shadow-xl rounded-lg p-4 w-full md:w-[45rem] relative bg-white hover:shadow-2xl transition-shadow duration-300">
			<div class="w-full flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
				<div class="flex items-center gap-2">
					<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
					<div class="text-sm font-semibold text-gray-700">
						Route: <span class="font-mono text-blue-600">{routeName}</span>
					</div>
				</div>
				<Button buttonAction={copyToClipboard} buttonType="filled-secondary" buttonWidth="5rem">
					<span class="flex items-center gap-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							height="18"
							width="18"
							class="stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						<span class="text-xs">Copy</span>
					</span>
				</Button>
			</div>
			<div class="p-4 mb-4">
				{#if routeName === '/api/wizardcoder'}
					{@html parsedData}
				{:else}
					{#each processTextAndCodeBlocks(data) as block}
						{#if block.type === 'code'}
							{#if block.inline}
								<code class="px-2 py-1 m-0 text-sm break-spaces bg-gray-100 border border-gray-300 rounded-md font-mono text-gray-800"
									>Code: {block.code}</code
								>
							{:else}
								<div class="py-4 px-2">
									<CodeBlock language={block.language} code={`${block.code}`} />
								</div>
							{/if}
						{:else}
							<div class="prose prose-sm max-w-none text-gray-700 leading-relaxed">
								{@html block.content}
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
