export type List<T> = {
	prev: List<T>;
	next: List<T>;
	value: T;
} | null;

export function LRUCache<T>(maxSizeIncl: number) {
	console.log("CACHE CONSTRUCTOR");

	if (maxSizeIncl < 1) {
		throw new Error(`LRUCache: maxSizeIncl must be at least 1`);
	}

	// eslint-disable-next-line prefer-const
	let tail: List<T> = null;
	// eslint-disable-next-line prefer-const
	let head: List<T> = tail;

	const map: Map<T, List<T>> = new Map();

	let size: number = 0;

	function add(value: T): void {
		if (size >= maxSizeIncl) {
			removeByValueOrLRUPolicy(value);
			size--;
		}

		/**
		 * remove node if the value has already been stored
		 * since we'll add it, just at the end of the list
		 * as the most recently used one
		 *
		 */
		if (map.has(value)) {
			console.log("map has val");
			removeByValueOrLRUPolicy(value);
			size--;
		} else {
			console.log("map does not have val");
		}

		const newNodeReference: List<T> = { prev: null, value, next: null };

		if (tail === null) {
			console.log("TAIL === null, head === null ?", head === null);
		}

		if (head === null) {
			head = newNodeReference;
			tail = head;
		} else {
			newNodeReference.prev = head;
			head.next = newNodeReference;
			head = head.next;
		}

		size++;

		map.set(value, newNodeReference);
	}

	function addMany(values: T[]) {
		values.forEach((val) => add(val));
	}

	function removeByValueOrLRUPolicy(value: T): void {
		let nodeReference: List<T>;

		if (!map.has(value)) {
			nodeReference = tail;
		} else {
			nodeReference = map.get(value)!;
		}

		if (nodeReference === undefined || nodeReference === null) {
			throw new Error(`LRUCache: nodeReference cannot be undefined (or null?) when deleting`);
		}

		const prevNodeRef = nodeReference.prev;
		const nextNodeRef = nodeReference.next;

		map.delete(value);

		if (prevNodeRef === null && nextNodeRef === null) {
			/** node to be deleted is the *only* node */
			tail = null;
			head = null;
		} else if (prevNodeRef === null) {
			/** node to be deleted is the *first* node */
			tail = nextNodeRef;

			/** typescript / eslint should infer this itself */
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			nextNodeRef!.prev = null;
		} else if (nextNodeRef === null) {
			/** node to be deleted is the *last* node */

			head = prevNodeRef;
			prevNodeRef.next = null;
		} else {
			prevNodeRef.next = nextNodeRef;
			nextNodeRef.prev = prevNodeRef;
		}
	}

	const getMostRecent = (): T | undefined => head?.value;

	const getAllOldToNew = (): T[] => {
		const values: T[] = [];

		let temp = tail;

		while (temp !== null) {
			values.push(temp.value);
			temp = temp.next;
		}

		return values;
	};

	const getAllNewToOld = (): T[] => {
		const values: T[] = [];

		let temp = head;

		while (temp !== null) {
			values.push(temp.value);
			temp = temp.prev;
		}

		return values;
	};

	/** TESTING */
	// add(-1 as any);

	const getTail = (): List<T> => tail;
	const getHead = (): List<T> => head;
	const getSize = (): number => size;
	const getMaxSize = (): number => maxSizeIncl;

	return {
		add,
		addMany,
		getMostRecent,
		getAllOldToNew,
		getAllNewToOld,
		getTail,
		getHead,
		get: () => ({
			getMostRecent: getMostRecent(), //
			getAllOldToNew: getAllOldToNew(),
			getAllNewToOld: getAllNewToOld(),
			getTail: getTail(),
			getHead: getHead(),
			getSize: getSize(),
			getMaxSize: getMaxSize(),
		}),
	};
}

// const c = LRUCache<number>(400000);

// c.add(5);
// c.add(9);
// c.add(11);
// c.add(16);
// c.add(9);
// c.add(69);
// c.add(69);
// c.add(69);
// c.add(69);
// c.add(11);

// console.log(c.get());
