import { scrape } from "./scraper";
import { IScraperConfig, createScraperConfig } from "./config";

export * from "./config";
export * from "./wasScheduleUpdated";

const isCurrentlyScraping = (): boolean => false;
const createLockfile = (): void => {};
const removeLockfile = (): void => {};

const scraper = async (outDir: string): Promise<void> => {
	if (isCurrentlyScraping()) {
		const path: string = "?";
		throw new Error(`refusing to scrape - lockfile present at ${path}`);
	}

	try {
		createLockfile();

		const config: IScraperConfig = createScraperConfig(outDir);

		await scrape(config);
	} finally {
		removeLockfile();
	}
};

export default scraper;
