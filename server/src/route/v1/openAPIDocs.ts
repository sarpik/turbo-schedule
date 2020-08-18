import fs from "fs-extra";
import { RequestHandler } from "express";

import { openAPIFilePath } from "../../config";
import { isProd } from "../../util/isProd";

/** read initially (@note - wont update until you restart!) */

let openAPIDocsJSON: string = "{}";

/**
 * TODO - figure out if we need to read the json file
 * on every request or just read it initially and stick with it.
 */
export const openAPIDocsJSONHandler: RequestHandler = async (_req, res, next) => {
	try {
		if (!(await fs.pathExists(openAPIFilePath))) {
			openAPIDocsJSON = "{}";
			console.log("  ! openAPIDocsJSON not found (`%s`)", openAPIFilePath);
		} else {
			openAPIDocsJSON = await fs.readJSON(openAPIFilePath, {
				encoding: "utf-8",
			});
		}

		res.setHeader("Content-Type", "application/json");
		res.send(openAPIDocsJSON);
		return !isProd() ? next() : res.end();
	} catch (err) {
		return next(err); /** this is intended to be handled by `next` either way */
	}
};

export const openAPIDocsHTMLHandler: RequestHandler = (_req, res, next) => {
	if (res.headersSent) {
		return next();
	}

	try {
		/**
		 * see https://github.com/Redocly/redoc#deployment
		 */

		const html: string = `
<!DOCTYPE html>
<html>
	<head>
		<title>ReDoc</title>
		<!-- needed for adaptive design -->
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet"> -->

		<!--
		ReDoc doesn't change outer page styles
		-->
		<style>
		body {
			margin: 0;
			padding: 0;
		}
		</style>
	</head>
	<body>
		<redoc spec-url="/api/v1/docs.json" hide-download-button></redoc>

		<!--  NOTE - the script MUST come AFTER the 'redoc' thing lmao  -->
		<script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"> </script>
	</body>
</html>
`;

		res.setHeader("Content-Type", "text/html");
		res.send(html);

		return !isProd() ? next() : res.end();
	} catch (err) {
		return next(err); /** this is intended to be handled by `next` either way */
	}
};
