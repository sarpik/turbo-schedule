/**
 * https://reactrouter.com/web/example/queryParams-parameters
 */

import { useHistory } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";

export type TQuery = string;
export type TSetQuery<T> = (query: T, shouldReplace?: boolean) => void;

export type EncoderDecoder<T> = {
	encode: (value: T) => TQuery;
	decode: (value: TQuery) => T;
};

export const arrayEncoderDecoder: EncoderDecoder<string[]> = {
	encode: (x) => x.join(","),
	decode: (x) =>
		x
			.split(",")
			.map((y) => y.trim())
			.filter((y) => !!y),
};

export const defaultEncoderDecoder = {
	encode: (value: any) => (value as unknown) as TQuery,
	decode: (value: any) => (value as unknown) as string,

	// encode: (value) => (value as unknown) as TQuery,
	// decode: (value) => (value as unknown) as T,
};

/**
 * NOTE: Memoize the encode / decode functions / the encoderDecoder!
 */
export const useQueryFor = <T = string>(
	key: string, //
	{
		defaultValueFallback,
		valueOverrideOnceChanges,
		encode,
		decode,
		dependencies,
	}: EncoderDecoder<T> & {
		defaultValueFallback?: TQuery; //
		valueOverrideOnceChanges?: TQuery;
		dependencies?: any[];
	} = {
		encode: (value) => (value as unknown) as TQuery,
		decode: (value) => (value as unknown) as T,
		dependencies: [],
	}
	// ): [T, TSetQuery<T>] => {
) => {
	const history = useHistory();

	const _queryParams = new URLSearchParams(history.location.search);

	const [query, _setQuery] = useState<T>(decode(_queryParams.get(key) ?? defaultValueFallback ?? ""));

	const setQuery: TSetQuery<T> = useCallback(
		(_q, shouldReplace = false) => {
			const params = new URLSearchParams(history.location.search);

			const q = encode(_q);

			if (!q) {
				params.delete(key);
				_setQuery(decode(""));
			} else {
				params.set(key, q);
				_setQuery(_q);
			}

			if (shouldReplace) {
				history.replace({ search: params.toString() });
			} else {
				history.push({ search: params.toString() });
			}
		},
		[history, key, encode, decode]
	);

	useEffect(() => {
		if (valueOverrideOnceChanges) {
			setQuery(decode(valueOverrideOnceChanges));
		}
	}, [valueOverrideOnceChanges, setQuery, decode]);

	/**
	 * "re-run" on dependency change
	 */
	useEffect(() => {
		_setQuery(decode(_queryParams.get(key) ?? ""));

		/**
		 * TODO verify fully that works properly
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return [query, setQuery] as const;
};
