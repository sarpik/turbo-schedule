import {
	Participant,
	Lesson,
	NonUniqueLesson,
	mergeDuplicateLessons,
	sortLessons,
	delaySync,
} from "@turbo-schedule/common";

import { extractLessonFromTeacher } from "./extractLessons";
import { createLesson } from "../initializer/createLesson";

// const awaitAll = async <T>(promises: Promise<T[]>[]) => await Promise.all(promises);
// const sequentiallyAwaitAll = async <T>(promises: Promise<T[]>[]) =>
// 	await promises.map(async (promise: Promise<T[]>) => await promise);
// const flatten = <T>(items: T[][]): T[] => items.flat();

const createLeanLessons = (lessons: NonUniqueLesson[]) => lessons.map(createLesson);

export const scrapeAndDoMagicWithLessonsFromParticipants = async (
	participants: Participant[] = [],
	lessonPromises: Promise<NonUniqueLesson[]>[] = participants
		.map((p) =>
			extractLessonFromTeacher(p.originalScheduleURI, {
				text: p.text,
				isActive: true,
				labels: p.labels,
			})
		)
		.flat()
): Promise<Lesson[]> => {
	const res = await Promise.all(
		lessonPromises.map(async (promise) => {
			const result = await promise;

			delaySync(200);

			return result;
		})
	);

	const flattened = res.flat();

	const merged = mergeDuplicateLessons(flattened);

	const sorted = sortLessons(merged);

	const lean = createLeanLessons(sorted);

	return lean;
};
/*
	await (lessonPromises |> sequentiallyAwaitAll)
		|> flatten
		|> mergeDuplicateLessons
		|> sortLessons
		|> createLeanLessons
	;

	*/
