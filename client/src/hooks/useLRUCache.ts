import { Student, Teacher, Class, Room, Participant, LRUCache } from "@turbo-schedule/common";
import { useRef } from "react";
// import { useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

// export function createUsePersistedLRUCache<T = unknown>(key: string, maxSizeIncl: number) {
// 	const cache = LRUCache<T>(maxSizeIncl);

// 	return function usePersistedLRUCache(): [T[], (value: T) => void] {
// 		// const [cache, setCache] = useState(LRUCache<T>(maxSizeIncl));

// 		console.log("1. cache", cache.getAllFromOldestToNewest());

// 		cache.addMany(JSON.parse(localStorage.getItem(key) ?? "[]"));

// 		const [persistedCache, _setPersistedCache] = useLocalStorage(key, cache.getAllFromOldestToNewest());
// 		console.log("2. persistedCache", persistedCache);

// 		// console.log("cache", cache.getAllFromOldestToNewest(), "persistedCache", persistedCache);

// 		/** recover */
// 		cache.addMany(persistedCache);
// 		console.log("3. cache after recovery", cache.getAllFromOldestToNewest());

// 		// _setPersistedCache(cache.getAllFromOldestToNewest());
// 		// console.log("4. persistedCache after persisting", persistedCache);

// 		const addNewEntry = (value: T): void => {
// 			console.log("adding new entry");
// 			cache.add(value);

// 			_setPersistedCache(cache.getAllFromOldestToNewest());

// 			console.log(
// 				"x. add new entry",
// 				value,
// 				cache.getAllFromOldestToNewest(),
// 				"val after adding",
// 				persistedCache
// 			);
// 		};

// 		return [[...cache.getAllFromOldestToNewest()], addNewEntry];

// 		// return [
// 		// 	cache.getAllFromOldestToNewest(),
// 		// 	(value) => {
// 		// 		cache.add(value);
// 		// 		setCache(cache);
// 		// 	},
// 		// ];
// 	};
// }

// export function createUsePersistedLRUCache<T = unknown>(key: string, _maxSizeIncl: number) {
// 	return function usePersistedLRUCache(): [T[], (value: T) => void] {
// 		const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, []);

// 		const add = (val: T) => _setPersistedCache([...persistedCache.filter((p) => p !== val), val]);

// 		return [persistedCache, add];
// 	};
// }

// const cache = LRUCache<any>(69);

// export function createUsePersistedLRUCache<T = unknown>(key: string, _maxSizeIncl: number) {
// 	return function usePersistedLRUCache(): [T[], (value: T) => void] {
// 		// const ref = useRef(LRUCache<T>(_maxSizeIncl));
// 		// const cache = ref.current;

// 		(window as any).cache = cache;

// 		const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(
// 			key,
// 			cache.getAllFromOldestToNewest() ?? localStorage.getItem(key) ?? []
// 		);

// 		cache.addMany(persistedCache);
// 		console.log("cache", cache.getAllFromOldestToNewest());

// 		// const add = (val: T) => _setPersistedCache([...persistedCache.filter((p) => p !== val), val]);

// 		const add = (val: T) => {
// 			cache.add(val);

// 			console.log("add", cache.getAllFromOldestToNewest());

// 			// _setPersistedCache([...persistedCache.filter((p) => p !== val), val]);
// 			_setPersistedCache([...cache.getAllFromOldestToNewest()]);
// 		};

// 		return [persistedCache, add];
// 	};
// }

/** WORKS !!!  */
// export function createUsePersistedLRUCache<T = unknown>(key: string, _maxSizeIncl: number) {
// 	return function usePersistedLRUCache(): [T[], (value: T) => void] {
// 		const cache = useRef(LRUCache(_maxSizeIncl));

// 		(window as any).ca = cache.current;

// 		const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, []);

// 		cache.current.addMany(persistedCache);

// 		const add = (val: T) => {
// 			_setPersistedCache([...persistedCache.filter((p) => p !== val), val]);
// 			cache.current.add(val);
// 			console.log("added", cache.current.get());
// 		};

// 		return [persistedCache, add];
// 	};
// }

/** WORKS 2 !!! */
// export function createUsePersistedLRUCache<T = unknown>(key: string, _maxSizeIncl: number) {
// 	return function usePersistedLRUCache(): [T[], (value: T) => void] {
// 		const cache = useRef(LRUCache<T>(_maxSizeIncl));

// 		(window as any).ca = cache.current;

// 		// const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, cache.current.getAllOldToNew());
// 		const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, []);

// 		cache.current.addMany(persistedCache);

// 		const add = (val: T) => {
// 			// _setPersistedCache([...persistedCache.filter((p) => p !== val), val]);
// 			cache.current.add(val);
// 			_setPersistedCache(cache.current.getAllOldToNew());
// 		};

// 		return [cache.current.getAllOldToNew(), add];
// 	};
// }

export function createUsePersistedLRUCache<T = unknown>(key: string, _maxSizeIncl: number) {
	return function usePersistedLRUCache(): [T[], (value: T) => void] {
		const cache = useRef(LRUCache<T>(_maxSizeIncl));

		(window as any).ca = cache.current;

		// const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, cache.current.getAllOldToNew());
		const [persistedCache, _setPersistedCache] = useLocalStorage<T[]>(key, []);

		cache.current.addMany(persistedCache);

		const add = (val: T) => {
			// _setPersistedCache([...persistedCache.filter((p) => p !== val), val]);
			cache.current.add(val);
			_setPersistedCache(cache.current.getAllOldToNew());
		};

		return [cache.current.getAllOldToNew(), add];
	};
}

const maxCacheSize: number = 100000;

export const useMostRecentlyViewedStudents = createUsePersistedLRUCache<Student["text"]>(
	"turbo-schedule.most-recent-students",
	maxCacheSize
);
export const useMostRecentlyViewedTeachers = createUsePersistedLRUCache<Teacher["text"]>(
	"turbo-schedule.most-recent-teachers",
	maxCacheSize
);
export const useMostRecentlyViewedClasses = createUsePersistedLRUCache<Class["text"]>(
	"turbo-schedule.most-recent-classes",
	maxCacheSize
);
export const useMostRecentlyViewedRooms = createUsePersistedLRUCache<Room["text"]>(
	"turbo-schedule.most-recent-rooms",
	maxCacheSize
);

export const useMostRecentlyViewedParticipants = createUsePersistedLRUCache<Participant["text"]>(
	"turbo-schedule.most-recent-participants",
	maxCacheSize * 4
);
