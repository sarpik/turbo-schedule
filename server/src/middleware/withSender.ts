/* eslint-disable indent */

import { Request, Response, NextFunction } from "express";

import { isProd } from "../util/isProd";

export interface WithErr<E = unknown> {
	err?: E;
}

export const createSend = <_T, E = unknown, T extends _T & WithErr<E> = _T & WithErr<E>>(
	res: Response<T>, //
	next: NextFunction,
	defaultData: T
) => (code: number, data: T = defaultData): void => {
	res.status(code).json(data);
	if (data.err) console.error(data.err);
	return !isProd() ? (data.err ? next(data.err) : next()) : res.end();
};

export const withSender = <T>(defaultData: T) => (_req: Request, res: Response<T>, next: NextFunction): void => {
	const send = createSend(res, next, defaultData);
	res.sender = send;
	next();
};
