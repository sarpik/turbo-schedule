#!/usr/bin/env ts-node-dev
// start-server.ts

/**
 * @note
 * when          in typescript, run with `ts-node-dev` or simply `./`;
 * when compiled to javascript, run with `node`;
 */

import { startServer } from "../server";

process.on("SIGINT", () => {
	console.log("~ bye bye!");
	process.exit();
});

	startServer();

