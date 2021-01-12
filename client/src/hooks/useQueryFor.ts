/**
 * https://reactrouter.com/web/example/queryParams-parameters
 */

import { useLocation, useHistory } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

type TSetQuery = (query: string, shouldReplace?: boolean) => void;

export const useQueryFor = (
	key: string, //
	defaultValueFallback?: string
	/**
	 * TODO: stringify() & parse() (put all in optional object?)
	 */
): [string, TSetQuery] => {
	const history = useHistory();
	const [_queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

	const [query, _setQuery] = useState<string>(_queryParams.get(key) ?? defaultValueFallback ?? "");

	const setQuery: TSetQuery = useCallback(
		(q, shouldReplace = false) => {
			const params = new URLSearchParams();

			params.append(key, q ?? "");

			if (shouldReplace) {
				history.replace({ search: params.toString() });
			} else {
				history.push({ search: params.toString() });
			}

			_setQuery(params.get(key) as string);

			console.log("params upd", params.toString());
		},
		[history, key]
	);

	/**
	 * on initial load
	 */
	useEffect(() => {
		const currQuery = _queryParams.get(key);

		if (currQuery === null || currQuery === undefined) {
			if (defaultValueFallback !== null && defaultValueFallback !== undefined) {
				setQuery(defaultValueFallback, true);
			} else {
				setQuery("");
			}
		}
	}, [_queryParams, defaultValueFallback, key, setQuery]);

	return [query, setQuery];
};
