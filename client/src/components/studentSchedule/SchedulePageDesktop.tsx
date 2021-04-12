/* eslint-disable react/prop-types */
/** not a concern since we're linking to a known website ourselves (github) */
/* eslint-disable react/jsx-no-target-blank */

/** TODO a11y */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React, { FC, useState, useContext, useEffect, useRef, useLayoutEffect, KeyboardEvent } from "react";
// import Select from "react-select";
import { css } from "emotion";

import { Lesson, Participant, getDefaultParticipant } from "@turbo-schedule/common";

import { Navbar } from "../navbar/Navbar";
import { LessonsList } from "./LessonsList";
import { DaysList } from "./DaysList";
import { LessonDisplay } from "./LessonDisplay";
import { fetchStudent } from "../../utils/fetchStudent";
import { getTodaysScheduleDay, ScheduleDay } from "../../utils/selectSchedule";
import { CurrentLangContext } from "../currentLangContext/currentLangContext";

// const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

interface Props {
	match: any; // match; /** TODO */
}

export const SchedulePageDesktop: FC<Props> = ({ match }) => {
	const { currentLang } = useContext(CurrentLangContext);

	useEffect(() => {
		console.log("currentLang", currentLang);
	}, [currentLang]);

	const searchElementRef = useRef<HTMLInputElement>(null);
	// const [searchString, setSearchString] = useState<string>(participant.text || "");
	const [searchString, setSearchString] = useState<string>(
		(match.params.participantHandle || match.params.studentName) as string
	);
	const [participant, setParticipant] = useState<Participant>(() => getDefaultParticipant());

	const [selectedDay, setSelectedDay] = useState<ScheduleDay>(() => getTodaysScheduleDay({ defaultToDay: 0 }));
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [selectedLessonTimeIndex, setSelectedLessonTimeIndex] = useState<number | undefined>(undefined);

	const navbarElement = useRef<HTMLElement>(null);
	const [navbarHeight, setNavbarHeight] = useState<number>(0);

	useEffect(() => {
		(async () => {
			const data = await fetchStudent(searchString);
			setParticipant(data);
		})();
	}, [searchString]);

	useLayoutEffect(() => {
		const height = navbarElement?.current?.clientHeight || 0;
		setNavbarHeight(height);
	}, [setNavbarHeight]);

	/**
	 * once the user selects a new day - this updates the selected lesson --
	 * it keeps the same time index, and just selects the lesson
	 * from the appropriate day.
	 */
	useEffect(() => {
		if (selectedLessonTimeIndex === null) {
			return;
		}

		const lesson: Lesson | undefined = participant?.lessons?.find(
			(l) => l.dayIndex === selectedDay && l.timeIndex === selectedLessonTimeIndex
		);

		if (!lesson) {
			return;
		}

		setSelectedLesson(lesson);
	}, [/** must */ selectedDay, /** secondary */ participant, selectedLessonTimeIndex]);

	const handleOnKeyDown = (_e: KeyboardEvent) => {
		// e.preventDefault();
		// if (e.key === "s" || e.key === "S") {
		// 	console.log("day down");
		// 	setSelectedDay(
		// 		(d) =>
		// 			(d === "*"
		// 				? scheduleDaysArray[1]
		// 				: d === scheduleDaysArray[scheduleDaysArray.length - 1]
		// 					? d
		// 					: d + 1) as ScheduleDay
		// 	);
		// } else if (e.key === "d" || e.key === "D") {
		// 	console.log("day up");
		// 	setSelectedDay(
		// 		(d) =>
		// 			(d === "*"
		// 				? scheduleDaysArray[0]
		// 				: d === scheduleDaysArray[1]
		// 				? scheduleDaysArray[0]
		// 				: d - 1) as ScheduleDay
		// 	);
		// }
		// else if (e.key === "j" || e.key === "J") {
		// 	setSelectedLessonTimeIndex(
		// 		(i) => (i !== undefined && participant?.lessons?.length && i + 1) || undefined
		// 		// clamp(i + 1, 0, participant.lessons.filter((l) => l.dayIndex === selectedDay).length - 1)
		// 	);
		// 	console.log("time down", selectedLessonTimeIndex);
		// } else if (e.key === "k" || e.key === "K") {
		// 	setSelectedLessonTimeIndex(
		// 		(i) => (i !== undefined && participant?.lessons?.length && i - 1) || undefined
		// 		// clamp(i - 1, 0, participant.lessons.filter((l) => l.dayIndex === selectedDay).length - 1)
		// 	);
		// 	console.log("time up", selectedLessonTimeIndex);
		// }
	};

	return (
		<div
			onKeyUp={(e) => handleOnKeyDown(e)}
			className={css`
				display: flex;
				flex-direction: column;

				height: 100vh;
				max-height: 100vh;
				width: 100vw;
				max-width: 100vw;

				overflow: hidden; /** TODO investigate if actually works */
			`}
		>
			<Navbar
				ref={navbarElement}
				search={{
					searchElementRef: searchElementRef,
					searchString,
					setSearchString,
				}}
			/>

			<main
				className={css`
					flex-grow: 1;

					max-height: calc(100% - ${navbarHeight}px);
					height: calc(100% - ${navbarHeight}px);
					overflow: hidden;

					display: flex;
					justify-content: space-between;
				`}
			>
				{/* 1st */}
				<DaysList selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

				{/* 2nd - lessons of the day list */}
				<LessonsList
					lessons={participant?.lessons ?? []}
					selectedDay={selectedDay}
					selectedLesson={selectedLesson}
					handleClick={(_e, lesson) => {
						setSelectedLesson(lesson);
						setSelectedLessonTimeIndex(lesson.timeIndex);
					}}
				/>

				{/* 3rd */}
				<article
					className={css`
						/* background: lightskyblue; */
						flex: 5;
						flex-shrink: 3;

						overflow-x: hidden;
						overflow-y: auto;
					`}
				>
					<LessonDisplay lesson={selectedLesson} />
				</article>
			</main>
		</div>
	);
};
