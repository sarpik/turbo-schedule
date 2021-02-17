import { initDb, Db } from "@turbo-schedule/database";

import { getFrontPageHtml } from "./util/getFrontPageHtml";
import { createPageVersionIdentifier } from "./util/createPageVersionIdentifier";

export const wasScheduleUpdated = async (): Promise<boolean> => {
	let db: Db;
	let pageVersionIdentifier: string;

	try {
		db = await initDb();
		pageVersionIdentifier = await db.get("scrapeInfo").value().pageVersionIdentifier;
	} catch (e) {
		console.error("db file not initialized or corrupt -- returning `true` to force update. error:", e);
		return true;
	}

	const frontPageHtml: string = await getFrontPageHtml();
	const potentiallyUpdatedPageVersionIdentifier: string = createPageVersionIdentifier(frontPageHtml);

	const wasUpdated: boolean = pageVersionIdentifier !== potentiallyUpdatedPageVersionIdentifier;

	return wasUpdated;
};
