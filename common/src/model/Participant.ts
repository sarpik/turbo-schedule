/* eslint-disable import/no-cycle */
import { StudentFromList } from "./Student";
import { Class } from "./Class";
import { Teacher } from "./Teacher";
import { Room } from "./Room";
import { getSpecificScheduleURI } from "./Schedule";
import { Lesson } from "./Lesson";

import { mergeBy, MergeStrategy } from "../util/mergeBy";

export type ParticipantType = StudentFromList | Class | Teacher | Room;

export type ParticipantLabel = "student" | "class" | "teacher" | "room";

export interface ParticipantInLesson {
	text: string /** TODO `name` */;
	isActive: boolean;
	labels: ParticipantLabel[];
}

export type ParticipantInitData = Omit<Participant, "originalScheduleURI">;

export interface Participant {
	text: string;
	originalHref: string;
	originalScheduleURI: string;
	labels: ParticipantLabel[];

	lessons?: Lesson[];
}

export type WantedParticipant = Pick<Participant, "text" | "labels">;

export const getDefaultParticipantLean = (): ParticipantInLesson => ({
	text: "",
	isActive: false,
	labels: [],
});

export const getDefaultParticipant = (): Participant => ({
	// ...getDefaultScrapable(),
	text: "",
	originalHref: "",
	originalScheduleURI: getSpecificScheduleURI(""),
	labels: [],
});

const mergeStrat: MergeStrategy<ParticipantInLesson> = (left, right): ParticipantInLesson => ({
	...left,
	labels: [...new Set([...left.labels, ...right.labels])],
});

export const mergeDuplicateParticipantsInLessons = mergeBy("text", mergeStrat);

export const participantHasLesson = (participant: Participant) => (lesson: Lesson): boolean =>
	lesson.students.includes(participant.text) ||
	lesson.classes.includes(participant.text) ||
	lesson.teachers.includes(participant.text) ||
	lesson.rooms.includes(participant.text);

type DayTimeId = string;
type Duplicates = Record<Participant["text"], Record<DayTimeId, Lesson[]>>;

/**
 * should return an empty object, but sometimes,
 * if the upstream messes up, this might find some duplicates
 */
export const findParticipantsWithMultipleLessonsInSameTime = (
	participants: Participant[], //
	lessons: Lesson[]
): Duplicates => {
	/**
	 * duplciate candidates.
	 *
	 * collect all lessons for a participant at every day & time combination,
	 * and keep those that had more than 1 lesson in the same day & time
	 */
	const dupes: Duplicates = {};

	participants.forEach((participant) => {
		dupes[participant.text] = {};

		lessons.filter(participantHasLesson(participant)).forEach((lesson) => {
			const dayTimeId: DayTimeId = [lesson.timeIndex, lesson.dayIndex].join("/");

			if (!dupes[participant.text][dayTimeId]) {
				dupes[participant.text][dayTimeId] = [];
			}

			dupes[participant.text][dayTimeId].push(lesson);
		});

		/** it's a duplicate if there's more than 1 lesson in the same time */
		const confirmedDuplicates = Object.entries(dupes[participant.text]).filter(
			([_key, duplicateLessons]) => duplicateLessons.length > 1
		);

		if (confirmedDuplicates.length === 0) {
			delete dupes[participant.text];
		} else {
			dupes[participant.text] = Object.fromEntries(confirmedDuplicates);
		}
	});

	return dupes;
};
