import { SECRET_OPENAI_KEY } from '$env/static/private';
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';
import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async ({ url }) => {
	const promptMessage = url.searchParams.get(`prompt`) || `Hello`;
	try {
		if (!SECRET_OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set');
		}

		const reqMessages = [{ role: 'user', content: promptMessage }];

		if (!reqMessages) {
			throw new Error('no messages provided');
		}

		const prompt = 'You are a helpful assistant. Your name is GPT-4';

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		];

		const chatRequestOpts: CreateChatCompletionRequest = {
			//model: 'gpt-4-0314',
			// NOTE: keep this on a currently-available model so the app runs out of the box.
			model: 'gpt-4o-mini',

			messages,
			temperature: 0,
			stream: true
		};

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${SECRET_OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		});

		if (!chatResponse.ok) {
			const err = await chatResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
			const errorMessage = err?.error?.message || err?.error || 'Unknown error';
			const errorType = err?.error?.type || '';
			
			// Provide more helpful error messages
			let userFriendlyMessage = errorMessage;
			if (errorMessage.includes('Invalid API key') || errorMessage.includes('incorrect API key')) {
				userFriendlyMessage = 'Invalid API key. Please check your SECRET_OPENAI_KEY in .env file.';
			} else if (errorMessage.includes('insufficient_quota') || errorType === 'insufficient_quota') {
				userFriendlyMessage = 'Insufficient quota. Please add credits to your OpenAI account.';
			} else if (errorMessage.includes('rate_limit')) {
				userFriendlyMessage = 'Rate limit exceeded. Please try again in a moment.';
			}
			
			throw new Error(userFriendlyMessage);
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error('API Error:', err);
		const errorMessage = err instanceof Error ? err.message : 'There was an error processing your request';
		
		// Return a proper SSE error response
		const errorStream = new ReadableStream({
			start(controller) {
				const encoder = new TextEncoder();
				controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
				controller.enqueue(encoder.encode('event: error\ndata: \n\n'));
				controller.close();
			}
		});
		
		return new Response(errorStream, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	}
};
