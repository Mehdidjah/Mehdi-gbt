import { writable } from 'svelte/store';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
	id: string;
	message: string;
	variant: ToastVariant;
	timeoutMs: number;
};

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	function remove(id: string) {
		update((items) => items.filter((t) => t.id !== id));
	}

	function push(message: string, opts?: Partial<Pick<ToastItem, 'variant' | 'timeoutMs'>>) {
		const id = crypto.randomUUID();
		const toast: ToastItem = {
			id,
			message,
			variant: opts?.variant ?? 'info',
			timeoutMs: opts?.timeoutMs ?? 4000
		};

		update((items) => [toast, ...items]);

		// auto-dismiss
		setTimeout(() => remove(id), toast.timeoutMs);
		return id;
	}

	return { subscribe, push, remove };
}

export const toastStore = createToastStore();


