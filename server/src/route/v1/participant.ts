/**
 * This is pretty much identical to the `student` & `class` API
 */

import { Router } from "express";

import { initDb, Db } from "@turbo-schedule/database";
import {
	Participant, //
	Lesson,
	Availability,
	pickNPseudoRandomly,
	pickSome,
	participantHasLesson,
	findParticipantsWithMultipleLessonsInSameTime,
	MinimalLesson,
	WantedParticipant,
} from "@turbo-schedule/common";

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

/**
 * req.query:
 * - `count` (optional): exact count of how many participants to return
 * - `max`   (optional): maximum number of participants to return IF an exact count is not specified
 */
router.get("/random", async (req, res, next) => {
	const db: Db = await initDb();
	const participants: Participant[] = await db.get("participants").value();

	if (!req.query["count"]) {
		const maxCount: number = Number(req.query["max"]) || 32;

		res.json({ participants: pickSome(participants, { maxCount }) });
		return !isProd() ? next() : res.end();
	} else {
		const n = Number(req.query["count"]);

		if (Number.isNaN(n)) {
			const msg: string = `req.query.count NaN (provided as \`${req.query["count"]}\`, parsed as ${n})`;

			res.status(400).json({
				participants: [],
				message: msg,
			});

			return !isProd() ? next(msg) : res.end();
		} else {
			res.json({ participants: pickNPseudoRandomly(n)(participants) });
			return !isProd() ? next() : res.end();
		}
	}
});

router.get("/common-availability", async (req, res, next) => {
	const getDefaultReturn = () => ({
		minDayIndex: -1, //
		maxDayIndex: -1,
		minTimeIndex: -1,
		maxTimeIndex: -1,
		availability: [],
	});

	try {
		const db: Db = await initDb();

		const wantedParticipants: Participant["text"][] =
			req.query?.["wanted-participants"]
				?.split(",")
				?.map((p: string | any) => p?.trim())
				.filter((p: string | any) => !!p) ?? [];

		const totalWantedParticipants: number = wantedParticipants.length;

		console.log(wantedParticipants, totalWantedParticipants);

		if (!wantedParticipants.length) {
			const msg: string = `Request query \`wanted-participants\` was empty (${wantedParticipants})`;

			console.error(msg);

			res.status(400).json({ ...getDefaultReturn(), msg });
			return !isProd() ? next(msg) : res.end();
		}

		const lessons: Lesson[] = await db
			.get("lessons")
			.filter(
				(l) =>
					wantedParticipants.some((w) => l.students.includes(w)) ||
					wantedParticipants.some((w) => l.classes.includes(w)) ||
					wantedParticipants.some((w) => l.teachers.includes(w)) ||
					wantedParticipants.some((w) => l.rooms.includes(w))
			)
			.value();

		const minDayIndex = lessons.reduce((prevMin, curr) => Math.min(prevMin, curr.dayIndex), 1e9);
		const maxDayIndex = lessons.reduce((prevMax, curr) => Math.max(prevMax, curr.dayIndex), 0);

		const minTimeIndex = lessons.reduce((prevMin, curr) => Math.min(prevMin, curr.timeIndex), 1e9);
		const maxTimeIndex = lessons.reduce((prevMax, curr) => Math.max(prevMax, curr.timeIndex), 0);

		const availability: Availability[][] = [];

		/**
		 * O(fast enough)
		 */
		for (let i = minDayIndex; i <= maxDayIndex; i++) {
			availability[i] = [];

			for (let j = minTimeIndex; j <= maxTimeIndex; j++) {
				const related: Lesson[] = lessons.filter((l) => l.dayIndex === i && l.timeIndex === j);

				type Ret = {
					participant: Participant["text"];
					lesson: MinimalLesson;
				};
				/**
				 * there could be multiple participants in the same lesson,
				 * thus account for them all, not once.
				 */
				const getParticipants = (filterPred: (l: Lesson) => boolean): Ret[] => [
					...new Set(
						related.filter(filterPred).flatMap((l) =>
							[l.students, l.teachers, l.classes, l.rooms].flatMap((participants) =>
								participants
									.filter((participant) => wantedParticipants.includes(participant))
									.map(
										(participant): Ret => ({
											participant,
											lesson: {
												id: l.id,
												name: l.name,
											},
										})
									)
							)
						)
					),
				];

				let availableParticipants = getParticipants((l) => l.isEmpty);
				const bussyParticipants = getParticipants((l) => !l.isEmpty);

				/**
				 * TODO FIXME HACK:
				 *
				 * The scraper is messed up for some edge cases (upstream -_-),
				 * and there might be duplicate lessons, some not properly scraped.
				 *
				 * We know for a fact, though, that if a participant is bussy,
				 * it cannot be available -- this fixes the issue (temporarily),
				 * before we fix the underlying issue.
				 *
				 */
				availableParticipants = availableParticipants.filter(
					(p) => !bussyParticipants.some((bussyP) => p.participant === bussyP.participant)
				);

				availability[i][j] = {
					dayIndex: i, //
					timeIndex: j,
					availableParticipants,
					bussyParticipants,
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
		res.status(500).json({
			...getDefaultReturn(),
			msg: err,
		});

		return !isProd() ? next(err) : res.end();
	}
});

router.get("/classify", async (req, res, next) => {
	interface Data {
		participants: WantedParticipant[];
		err?: unknown;
	}

	const send = (code: number, data: Data = { participants: [], err: null }) => {
		res.status(code).json(data);
		if (data.err) console.error(data.err);
		return !isProd() ? (data.err ? next(data.err) : next()) : res.end();
	};

	try {
		const participants: string[] =
			req.query?.["participants"]
				?.split(",")
				?.map((p: string) => p?.trim())
				.filter((p: string) => !!p) ?? [];

		if (!participants.length) {
			return send(400, { participants: [], err: `No participants included in request.query (${participants})` });
		}

		const db: Db = await initDb();

		const classifiedParticipants: Data["participants"] = await db
			.get("participants")
			.filter((p) => participants.includes(p.text))
			.map((p) => ({ text: p.text, labels: p.labels }))
			.value();

		console.log("classified", classifiedParticipants);

		return send(200, { participants: classifiedParticipants });
	} catch (err) {
		return send(500, { participants: [], err: err });
	}
});

router.get("/debug/duplicates", async (_req, res, next) => {
	try {
		const db: Db = await initDb();

		const participants: Participant[] = db.get("participants").value();
		const lessons: Lesson[] = db.get("lessons").value();

		const duplicates = findParticipantsWithMultipleLessonsInSameTime(participants, lessons);

		console.log("duplicates", duplicates);

		res.json({ duplicates });
		return !isProd() ? next() : res.end();
	} catch (e) {
		throw e;
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
			.filter(participantHasLesson(participant))
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
