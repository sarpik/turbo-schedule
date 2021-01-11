/**
 * This is pretty much identical to the `student` & `class` API
 */

import { Router } from "express";

import { initDb, Db } from "@turbo-schedule/database";
import { Participant, Lesson, Availability } from "@turbo-schedule/common";

import { isProd } from "../../util/isProd";

const router: Router = Router();

/**
 * get an array of schedule items (WITHOUT lessons)
 */
router.get("/", async (_req, res, next) => {
	try {
		const db: Db = await initDb();

		const participants: Participant[] = await db.get("participants").value();

		if (!participants?.length) {
			const msg: string = `Schedule items not found (were \`${participants}\`)`;

			console.error(msg);
			return res.status(404).json({ participants: [], message: msg });
		}

		res.json({ participants });

		return !isProd() ? next() : res.end();
	} catch (err) {
		console.error(err);
		res.status(500).json({ participants: [], message: err });
		return !isProd() ? next(err) : res.end();
	}
});

router.get("/common-availability", async (req, res, next) => {
	try {
		const db: Db = await initDb();

		// const _wanted: Participant["text"][] | Participant["text"] = req.query?.["wanted-participants"] ?? [];
		// const wanted: Participant["text"][] = Array.isArray(_wanted) ? _wanted : [_wanted];

		const wanted: Participant["text"][] =
			req.query?.["wanted-participants"]
				?.split(",")
				?.map((p: string | any) => p?.trim())
				.filter((p: string | any) => !!p) ?? [];

		const totalWantedParticipants: number = wanted.length;

		console.log(wanted, totalWantedParticipants);

		if (!wanted.length) {
			const msg: string = `Request query \`wanted-participants\` was empty (${wanted})`;

			console.error(msg);

			res.status(400).json({ participants: [], msg });
			return !isProd() ? next(msg) : res.end();
		}

		// const wantedParticipants: Participant[] = await db
		// 	.get("participants")
		// 	.filter((p) => wanted.includes(p.text))
		// 	.value();

		// console.log(wantedParticipants);

		/**
		 * we want to build a schedule that's common between all participants
		 * that indicates at each time period
		 * how many participants are available / unavailable
		 */

		const lessons: Lesson[] = await db
			.get("lessons")
			.filter(
				(l) =>
					wanted.some((w) => l.students.includes(w)) ||
					wanted.some((w) => l.classes.includes(w)) ||
					wanted.some((w) => l.teachers.includes(w)) ||
					wanted.some((w) => l.rooms.includes(w))
			)
			.value();

		const minDayIndex = lessons.reduce((prevMin, curr) => Math.min(prevMin, curr.dayIndex), 1e9);
		const maxDayIndex = lessons.reduce((prevMax, curr) => Math.max(prevMax, curr.dayIndex), 0);

		const minTimeIndex = lessons.reduce((prevMin, curr) => Math.min(prevMin, curr.timeIndex), 1e9);
		const maxTimeIndex = lessons.reduce((prevMax, curr) => Math.max(prevMax, curr.timeIndex), 0);

		const availability: Availability[][] = [];

		/**
		 * O(7) days * O(~10) time intervals * O(n * 7 * ~10) participants * max lessons = students * (days * time intervals)
		 * => O(7**2 * ~10**2 * n) where n = max participant count
		 */
		for (let i = minDayIndex; i <= maxDayIndex; i++) {
			availability[i] = [];

			for (let j = minTimeIndex; j <= maxTimeIndex; j++) {
				const related: Lesson[] = lessons.filter((l) => l.dayIndex === i && l.timeIndex === j);

				const bussy: number = related.filter((l) => !l.isEmpty).length;

				/**
				 * TODO: this is a work-around.
				 *
				 * We need to figure out why some participants don't have lessons
				 * even though others do
				 *
				 * -> it's probably because they have less maximum lessons
				 * and the scraper parses them like so.
				 *
				 * Thus maybe not so bad;
				 * we'll just need to think about how we'll populate
				 * which participants (by names) are available and which not.
				 * (still doable just fine - filter)
				 *
				 */
				// const available: number = related.filter((l) => l.isEmpty).length; /** TODO */
				const available: number = totalWantedParticipants - bussy;

				availability[i][j] = {
					dayIndex: i, //
					timeIndex: j,
					availableParticipants: available,
					bussyParticipants: bussy,
				};
			}
		}

		res.status(200).json({
			minDayIndex, //
			maxDayIndex,
			minTimeIndex,
			maxTimeIndex,
			availability,
		});

		return !isProd() ? next() : res.end();
	} catch (err) {
		console.error(err);
		res.status(500).json({ participant: {}, message: err });

		return !isProd() ? next(err) : res.end();
	}
});

/**
 * get full schedule of single participant by it's name
 */
router.get("/:participantName", async (req, res, next) => {
	try {
		const db: Db = await initDb();

		const participantName: string = decodeURIComponent(req.params.participantName);

		console.log("name", participantName);

		const participant: Participant = await db
			.get("participants")
			.find((p) => p.text.toLowerCase() === participantName.toLowerCase())
			.value();

		if (!participant) {
			const msg: string = `Participant not found (was \`${participant}\`)`;

			console.error(msg);
			return res.status(404).json({ participant: {}, message: msg });
		}

		const lessons: Lesson[] = await db
			.get("lessons")
			.filter(
				(lesson) =>
					lesson.students.includes(participant.text) ||
					// lesson.classes.includes(participant.text) || /** TODO analyze */
					lesson.teachers.includes(participant.text) ||
					lesson.rooms.includes(participant.text)
			)
			.value();

		if (!lessons?.length) {
			const msg: string = `Lessons for participant not found (were \`${lessons}\`)`;

			console.error(msg);
			return res.status(404).json({ participant, message: msg });
		}

		const participantWithLessons: Participant = { ...participant, lessons };

		res.json({ participant: participantWithLessons });

		return !isProd() ? next() : res.end();
	} catch (err) {
		console.error(err);
		res.status(500).json({ participant: {}, message: err });

		return !isProd() ? next(err) : res.end();
	}
});

/** --- */

export { router as participantRouter };
