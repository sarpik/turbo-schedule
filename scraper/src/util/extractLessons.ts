import cheerio from "cheerio";

import {
	getHtml, //
	ParticipantInLesson,
	NonUniqueLesson,
	createLessonWithParticipants,
	isClass,
	isRoom,
	isTeacher,
	isStudent,
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
