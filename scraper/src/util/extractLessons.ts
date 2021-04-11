import cheerio from "cheerio";

import {
	getHtml,
	ParticipantInLesson,
	NonUniqueLesson,
	createLessonWithParticipants,
	delayBlockingSync,
} from "@turbo-schedule/common";

import { prepareScheduleItems } from "./prepareScheduleItems";

export const extractLessonsFromIndividualHtmlPage: LessonExtractor = extractLessonsFactory(lessonExtractor);

export type LessonParser = (
	scheduleItem: CheerioElement, //
	dayIndex: number,
	timeIndex: number
) => NonUniqueLesson[];

export type LessonExtractor = (
	originalScheduleURI: string, //
	participant: ParticipantInLesson
) => Promise<NonUniqueLesson[]>;

function extractLessonsFactory(parser: LessonParser): LessonExtractor {
	return async (
		originalScheduleURI: string, //
		participant: ParticipantInLesson
	): Promise<NonUniqueLesson[]> => {
		const html: string = await getHtml(originalScheduleURI, "windows-1257");

		/**
		 * the production server works just fine without delays;
		 *
		 * on the development rig, however,
		 * I keep overhoarding the upstream & getting banned.
		 *
		 * It's starting to get confusing as to why some things help
		 * and some don't, but this seems good.
		 *
		 */
		if (process.env.NODE_ENV !== "production") {
			const delayMs: number = Number(process.env.SYNC_DELAY) ?? 250;
			delayBlockingSync(delayMs);
		}

		const scheduleItemsArray: CheerioElement[] = prepareScheduleItems(html);

		const howManyWorkdays: number = 5;
		const howManyLessonsMax: number = 9; /** todo automatic */

		let extractedLessonsArray: Array<NonUniqueLesson> = [];

		/** go NOT from left to right & down, but from TOP to bottom & left */
		for (let workDay = 0; workDay < howManyWorkdays; ++workDay) {
			for (let lessonTime = 0; lessonTime < howManyLessonsMax; ++lessonTime) {
				const lessonIndex = workDay + lessonTime * howManyWorkdays;

				const currentLessonItem: CheerioElement | undefined = scheduleItemsArray[lessonIndex];

				if (!currentLessonItem) {
					/** the schedule item was useless and was deleted, so skip it */
					continue;
				}

				const extractedLessons: NonUniqueLesson[] = parser(
					scheduleItemsArray[lessonIndex],
					workDay,
					lessonTime
				).map((lesson) => ({
					...lesson,
					participants: [...(lesson.participants ?? []), ...(participant ? [participant] : [])],
				}));

				extractedLessonsArray = [...extractedLessonsArray, ...extractedLessons];
			}
		}

		return extractedLessonsArray;
	};
}

const removeNewlineAndTrim = (content: string): string => content.replace(/\n/g, "").trim();

function lessonExtractor(
	scheduleItem: CheerioElement, //
	dayIndex: number,
	timeIndex: number
): NonUniqueLesson[] {
	const $ = cheerio(scheduleItem);
	const text = $.contents()
		.first()
		.text();

	const participantEntries = text
		.split("\n")
		.map(removeNewlineAndTrim)
		.filter((t) => /* ignore empty */ !!t && /* ignore multiple slashes */ !/^\/+$/.test(t));

	const isClass = (t: string): boolean =>
		/^\d\w/ /* 5a, 5b, 8a, 8b */
			.test(t) ||
		/^I+V?G?\w$/ /* IGa, IGb, Ia, IIGa, IIIGa, IVGa */
			.test(t);

	const isRoom = (t: string): boolean =>
		/^\w\d+/ /* A201 Maths, K113 Physics */
			.test(t) ||
		/^\(\d:\d\)/ /* (10:45) A201 Maths (somehow they manage to sometimes add the time *facepalm*) */
			.test(t) ||
		/^\w \w+/ /* A Maths, K Technology */
			.test(t) ||
		/^\w+ \d/ /* Workshop 1, Workshop 2 */
			.test(t);

	/**
	 * match non-latin characters aswell
	 * with the /\p{L}/u thingie.
	 *
	 * see https://stackoverflow.com/a/48902765/9285308
	 *
	 */
	const isTeacher = (t: string): boolean =>
		/\p{L}{2,} \p{L}{2,}( \p{L}{2,})?$/u.test(t) && !isClass(t.split(" ").reverse()[0]);

	const isStudent = (t: string): boolean => {
		const split = t.split(" ");
		const last = [...split].reverse()[0];
		const exceptLast = [...split].slice(0, -1).join(" ");

		if (isTeacher(exceptLast) && isClass(last)) {
			return true;
		}

		return false;
	};

	const isEmpty: boolean = participantEntries.length === 0;

	const name = participantEntries[0];
	participantEntries.shift();

	const filterAndWrapWithLabels = (
		filterPred: (t: string) => boolean,
		labels: ParticipantInLesson["labels"]
	): ParticipantInLesson[] =>
		participantEntries
			.filter(filterPred)
			.map((t): ParticipantInLesson => ({ isActive: !isEmpty, labels, text: t }));

	const participants: ParticipantInLesson[] = [
		...filterAndWrapWithLabels(isClass, ["class", "student"]),
		...filterAndWrapWithLabels(isRoom, ["room"]),
		...filterAndWrapWithLabels(isTeacher, ["teacher"]),
		...filterAndWrapWithLabels(isStudent, ["student"]),
	];

	const lesson: NonUniqueLesson = createLessonWithParticipants({
		isEmpty,
		dayIndex,
		timeIndex,
		name,
		participants,
	});

	return [lesson];
}
