// delay.ts

export const delay = async (ms: number): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * in situations where promises are mapped over
 * and then called all together with `Promise.all`,
 * the async `delay` will have no effect.
 *
 * To have actual delay, you'll need the synchronous one:
 */
export const delaySync = (ms: number): void => {
	const start = Date.now();
	let now = start;

	// while (now - start < ms) {
	while (start + ms > now) {
		now = Date.now();
	}
};
