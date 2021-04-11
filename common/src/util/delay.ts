// delay.ts

export const delay = async (ms: number): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, ms));
};

export const delayBlockingSync = (ms: number): void => {
	const startMs: number = Date.now();
	const endingMs: number = startMs + ms;

	while (endingMs > Date.now()) {
		/** wait while blocking the main thread */
	}
};
