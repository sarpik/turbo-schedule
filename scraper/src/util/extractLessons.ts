/* eslint-disable @typescript-eslint/no-use-before-define */

import cheerio from "cheerio";

import { getHtml, ParticipantInLesson, NonUniqueLesson, createLessonWithParticipants } from "@turbo-schedule/common";

import { prepareScheduleItems } from "./prepareScheduleItems";

/**
 * TODO rename these to `extractLessonsFromGrades5to10` and `extractLessonsFromGrades11to12`
 * and `extractLessonsFromEitherGrades`
 *
 * OR just do it yourself instead of using the factory
 * and expose only one method
 *
 * TODO turn `students` field into `participats` with `{ type: <enum>, text: <string>, isEmpty: <boolean> }`
 * See https://github.com/kiprasmel/turbo-schedule/issues/57
 */

export const extractLessonFromStudent: LessonExtractor = extractLessonsFactory(extractLessonFromStudentParser);
export const extractLessonFromClass: LessonExtractor = extractLessonsFactory(extractLessonFromClassParser);
export const extractLessonFromTeacher: LessonExtractor = extractLessonsFactory(extractLessonFromTeacherParser);

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
		// scheduleItemsArray = scheduleItemsArray.splice(0, 15);
		// const lessonsArray: Array<any> = scheduleItemsArray.map((scheduleItem, index) => extractLesson(scheduleItem, index));

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

function checkIsEmpty(name: string, teacher: string, room: string): boolean {
	return !name && !teacher && !room;
}

function extractLessonFromStudentParser(
	scheduleItem: CheerioElement, //
	dayIndex: number,
	timeIndex: number
): NonUniqueLesson[] {
	const itemWithClassNameTeacherAndRoom = scheduleItem.children[0] /** always skip this */.children;

	const name = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[0].children?.[0]?.data ?? "");
	const teacher = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[2]?.data ?? "");
	const room = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[4]?.data ?? "");

	const isEmpty: boolean = checkIsEmpty(name, teacher, room);

	const participants: ParticipantInLesson[] = [
		...teacher
			.split("\n")
			.map((t) => t.trim())
			.filter((t) => !!t)
			.map((t): ParticipantInLesson => ({ isActive: !isEmpty, labels: ["teacher"], text: t })),
		...room
			.split("\n")
			.map((r) => r.trim())
			.filter((r) => !!r)
			.map((r): ParticipantInLesson => ({ isActive: !isEmpty, labels: ["room"], text: r })),
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

function extractLessonFromClassParser(
	scheduleItem: CheerioElement, //
	dayIndex: number,
	timeIndex: number
): NonUniqueLesson[] {
	const itemWithClassNameTeacherAndRoom = scheduleItem.children[0] /** always skip this */.children;

	const $ = cheerio(scheduleItem);
	const text = $.contents()
		.first()
		.text();

	const newTexts = text
		.split("\n")
		.map(removeNewlineAndTrim)
		.filter((t) => /* ignore empty */ !!t && /* ignore multiple slashes */ !/^\/+$/.test(t));

	// console.log("text", text);
	console.log("newTexts", newTexts);

	// console.log("item with stuff", JSON.stringify(itemWithClassNameTeacherAndRoom));

	// console.log(JSON.stringify(itemWithClassNameTeacherAndRoom));

	const texts = itemWithClassNameTeacherAndRoom
		.filter((el) => {
			if (el.type === "tag" && el.name === "br") return false;
			if (el.type === "text" && !removeNewlineAndTrim(el?.data || "")) return false;

			return true;
		})
		.map((el) => {
			if (el.type === "tag" && el.name === "b") return el.children?.[0]?.data ?? "";
			if (el.type === "text") return el?.data ?? "";

			return "";
		})
		.map((str) => removeNewlineAndTrim(str ?? ""));

	// const texts = [
	// 	removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[0].children?.[0]?.data ?? ""),
	// 	removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[4]?.data ?? ""),
	// 	removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[6]?.data ?? ""),
	// ];

	// console.log("texts", texts, "itemWithClassNameTeacherAndRoom", JSON.stringify(itemWithClassNameTeacherAndRoom));

	const name = texts[0];

	texts.shift();

	let room, teacher, classes: string[];

	if (texts.filter((t) => !!t).length === 1) {
		room = texts[0];
		teacher = "";
		classes = [];
	} /* else if */ else {
		const isRoom = (text: string) => /\w{1}\d+/.test(text);

		if (isRoom(texts[2])) {
			teacher = texts[1];
			room = texts[2];

			classes = [];
		} else {
			classes = (texts[1] ?? "")
				.split(" ")
				.map((s) => s.trim())
				.filter((s) => !!s);

			teacher = texts[2];

			room = "";
		}
	}

	/** could be not found - upstream's logic */
	// const room = texts.find((text) => {
	// 	if (/^\w{1}\d+/.test(text)) {
	// 		return true;
	// 	}

	// 	return false;
	// });

	// /** actually, classes, but classify them as students */
	// const students = texts.find((text) => {
	// 	if (/^\d\w/.test(text) || /^I+V?G?\w/.test(text)) {
	// 		return true;
	// 	}

	// 	return false;
	// });

	// const name: string = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[0].children?.[0]?.data ?? "");
	// const room: string = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[6]?.data ?? "");
	// const teacher: string = removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[4]?.data ?? "");

	// const students: string[] = (removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[2]?.data ?? "") ?? [])
	// 	.split(" ")
	// 	.map((stud) => stud.trim())
	// 	.filter((stud) => !!stud);

	const isEmpty: boolean = checkIsEmpty(name, teacher, room);

	const participants: ParticipantInLesson[] = [
		...classes.map((c): ParticipantInLesson => ({ isActive: !isEmpty, labels: ["class", "student"], text: c })),
		...teacher
			.split("\n")
			.map((t) => t.trim())
			.filter((t) => !!t)
			.map((t): ParticipantInLesson => ({ isActive: !isEmpty, labels: ["teacher"], text: t })),
		...room
			.split("\n")
			.map((r) => r.trim())
			.filter((r) => !!r)
			.map((r): ParticipantInLesson => ({ isActive: !isEmpty, labels: ["room"], text: r })),
	];

	/** BEGIN TODO determinism */
	/**
	 * there's this thing where a class might contain multiple rooms & teachers
	 * all bunched up into a single lesson
	 *
	 * (see https://github.com/kiprasmel/turbo-schedule/issues/31#issuecomment-612715871)
	 *
	 * and we don't like that,
	 * so we'll split them into separate ones here, if needed!
	 *
	 */

	// const hasMultipleTeachersOrRooms: boolean = teacher.split("\n").length > 1 || room.split("\n").length > 1;

	// if (!hasMultipleTeachersOrRooms) {
	const lesson: NonUniqueLesson = createLessonWithParticipants({
		isEmpty,
		dayIndex,
		timeIndex,
		name,
		participants,
	});

	return [lesson];
	// }

	// /**
	//  * the lesson has multiple teachers or rooms. Good luck:D
	//  */

	// const teachers: string[] = teacher
	// 	.split("\n")
	// 	.map((t) => t.trim())
	// 	.filter((t) => !!t);

	// const rooms: string[] = room
	// 	.split("\n")
	// 	.map((r) => r.trim())
	// 	.filter((r) => !!r);

	// /**
	//  * if this is deterministic & we can tell where which teacher & room belongs too
	//  *
	//  * oh wait there'll be more than 1 lesson wiht the same day & time index --
	//  * which one should we show in the schedule?
	//  *
	//  * Determinism out the window, rip...
	//  */
	// /** TODO BEGIN good */
	// // if (teachers.length === rooms.length || teachers.length === 1 || rooms.length === 1) {
	// // 	const lessons: NonUniqueLesson[] = [];

	// // 	for (let i = 0; i < Math.max(teachers.length, rooms.length); ++i) {
	// // 		const currentLesson: NonUniqueLesson = new NonUniqueLesson({
	// // 			isEmpty,
	// // 			dayIndex,
	// // 			timeIndex,
	// // 			name,
	// // 			teacher: teachers.length === 1 ? teachers[0] : teachers[i],
	// // 			room: rooms.length === 1 ? rooms[0] : rooms[i],
	// // 		});

	// // 		lessons.push(currentLesson);
	// // 	}

	// // 	return lessons;
	// // }
	// /** TODO END good */

	// /**
	//  * otherwise - it's not deterministic
	//  */
	// // eslint-disable-next-line no-else-return
	// /** TODO BEGIN good */
	// // else {
	// /** TODO END good */
	// /** TODO BEGIN good */
	// // console.error("Teachers & rooms length was different! teachers:", teachers, "rooms:", rooms);
	// // throw new Error("Teachers & rooms length was different!");
	// /** TODO END good */

	// const lesson: NonUniqueLesson = new NonUniqueLesson({
	// 	isEmpty,
	// 	dayIndex,
	// 	timeIndex,
	// 	name,
	// 	participants,
	// 	/** BEGIN HACK */
	// 	// teacher: teachers.join(", ").trim(),
	// 	// room: rooms.join(", ").trim(),
	// 	/** END HACK */
	// 	// students,
	// });

	// return [lesson];

	// /**     teacher": ".* .*?,.*"    */
	// /** TODO BEGIN good */
	// // }
	// /** TODO END good */
	/** END TODO determinism */
}

function extractLessonFromTeacherParser(
	scheduleItem: CheerioElement, //
	dayIndex: number,
	timeIndex: number
): NonUniqueLesson[] {
	const itemWithClassNameTeacherAndRoom = scheduleItem.children[0] /** always skip this */.children;

	const isLessonForGrades5to8: boolean =
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[0].children?.[0]?.data ?? "") &&
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[6]?.data ?? "") &&
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[4]?.data ?? "");

	const isLessonForGrades10to12: boolean =
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[0].children?.[0]?.data ?? "") &&
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[2]?.data ?? "") &&
		!!removeNewlineAndTrim(itemWithClassNameTeacherAndRoom[4]?.data ?? "");

	const isEmpty: boolean = !isLessonForGrades5to8 && !isLessonForGrades10to12;

	if (isEmpty) {
		/** it doesn't matter which one (TODO make sure this is true in 100% of cases) */
		return extractLessonFromClassParser(scheduleItem, dayIndex, timeIndex);
	}

	if (isLessonForGrades5to8) {
		/** lesson for grades 5-10 */
		return extractLessonFromClassParser(scheduleItem, dayIndex, timeIndex);
	}

	/** lessons for grades 11-12 */
	return extractLessonFromStudentParser(scheduleItem, dayIndex, timeIndex);
}

const removeNewlineAndTrim = (content: string) => content.replace("\n", "").trim();
