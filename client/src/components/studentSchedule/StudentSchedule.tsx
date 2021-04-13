import React, { useState, useEffect, useRef } from "react";
import { throttle } from "lodash";

import { Lesson, Student } from "@turbo-schedule/common";

import "./StudentSchedule.scss";

import { useMostRecentlyViewedParticipants } from "hooks/useLRUCache";
import Footer from "../footer/Footer";
import { Navbar } from "../navbar/Navbar";
import { history } from "../../utils/history";
import StudentListModal from "./StudentListModal";
import Loading from "../../common/Loading";
import BackBtn from "../../common/BackBtn";

import { fetchStudent } from "../../utils/fetchStudent";
import DaySelector from "./DaySelector";
import { ScheduleDay, getTodaysScheduleDay } from "../../utils/selectSchedule";
import { useTranslation } from "../../i18n/useTranslation";
import { SchedulePageDesktop } from "./SchedulePageDesktop";
import { LessonsList } from "./LessonsList";

export interface IStudentScheduleProps {
	match: any /** TODO */;
}

const StudentSchedule = ({ match }: IStudentScheduleProps) => {
	const t = useTranslation();

	/** scroll to top of page on mount */
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	/** TODO week component */
	const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

	const isDesktop: boolean = windowWidth > 1024;

	const baseWeekStyles: React.CSSProperties = { verticalAlign: "top" };
	const weekStyles: React.CSSProperties = {
		...baseWeekStyles,
		...(windowWidth > 777 ? { display: "inline-block" } : { display: "block" }),
	};

	const throttledWindowWidth = useRef(
		throttle(() => {
			setWindowWidth(window.innerWidth);
		}, 1000)
	);

	window.addEventListener("resize", () => throttledWindowWidth.current());

	/** END TODO week component */

	const { params } = match;
	const { studentName } = params;

	const [isLoading, setIsLoading] = useState(true);
	const [scheduleByDays, setScheduleByDays] = useState([[]] as Array<Array<Lesson>>);

	// const [mostRecentlyViewed, markParticipantAsRecentlyViewed] = useMostRecentlyViewedParticipants();

	// console.log("mostRecentlyViewed", mostRecentlyViewed, "studName", studentName);

	// useEffect(() => {
	// 	markParticipantAsRecentlyViewed(studentName);
	// 	console.log("mostRecentlyViewed @ hook", mostRecentlyViewed, "studName", studentName);
	// }, [studentName]);

	const [mostRecent, addMostRecent] = useMostRecentlyViewedParticipants();

	console.log("mostRecent", mostRecent);

	useEffect(() => {
		addMostRecent(studentName);
	}, [studentName]);

	useEffect(() => {
		const wrapper = async () => {
			try {
				setIsLoading(true);
				const { lessons } = await fetchStudent(studentName);

				if (!lessons || !lessons.length) {
					setScheduleByDays([[]]);
					setIsLoading(false);
					return;
				}

				const tempScheduleByDays: Array<Array<Lesson>> = [];

				lessons.forEach((lesson) => {
					/** make sure there's always an array inside an array */
					if (!tempScheduleByDays[lesson.dayIndex]) {
						/**
						 * TODO FIXME! Not sure if this is correct :/
						 */
						// tempScheduleByDays.push([]);
						tempScheduleByDays[lesson.dayIndex] = [];
					}

					tempScheduleByDays[lesson.dayIndex].push(lesson);
				});

				setScheduleByDays(tempScheduleByDays);
				setIsLoading(false);
			} catch (err) {
				console.error("Error!", err);
				setScheduleByDays([[]]);
				setIsLoading(false);
			}
		};

		wrapper();
	}, [studentName]);

	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

	/**
	 * mimic the selectedDay
	 *
	 * TODO FIXME PARAMS - everything that comes from the route params, SHALL BE the single source of truth
	 * without any additional bs states, because we have to sync them & bugs come real quick
	 */
	const [selectedDay, __setSelectedDay] = useState<ScheduleDay>(getTodaysScheduleDay({ defaultToDay: 0 }));
	useEffect(() => {
		let dayIdx: ScheduleDay | undefined = decodeDay(params.dayIndex);

		if (!dayIdx && dayIdx !== 0) {
			dayIdx = getTodaysScheduleDay({ defaultToDay: 0 });

			navigateToDesiredPath({
				studentName,
				day: dayIdx,
				timeIndex: params.timeIndex,
				shouldShowTheLesson: !!selectedLesson || isDesktop,
				replaceInsteadOfPush: true,
			});
		}

		__setSelectedDay(dayIdx);
	}, [params.dayIndex, params.timeIndex, studentName, isDesktop, selectedLesson]);

	useEffect(() => {
		if (params.timeIndex === undefined || !scheduleByDays?.[selectedDay]?.length) {
			setSelectedLesson(null);
			return;
		}

		const lesson: Lesson = scheduleByDays[selectedDay].find(
			(l: Lesson) => l.dayIndex === selectedDay && l.timeIndex === decodeTimeIndex(params.timeIndex)
		);

		console.log("lesson", lesson);

		if (!lesson) {
			return;
		}

		setSelectedLesson(lesson);
	}, [params.timeIndex, scheduleByDays, selectedDay]);

	/**
	 * used to handle cases where a user comes to a URL with the `timeIndex` already set,
	 * meaning they have nowhere back to go,
	 * and we handle their history slightly differently
	 * once they close the lesson @ mobile
	 *
	 * this is the best I have came up with.
	 * There are obviously cases where you edit the URL
	 * AFTER visiting the site already
	 * & thus the handling will be slightly incorrect,
	 * but it's better & worth it either way.
	 */
	const canGoBackInHistory = useRef<boolean>(params.timeIndex === undefined);

	if (isLoading) {
		return (
			<>
				<BackBtn />

				<h1>{studentName}</h1>

				<Loading />
			</>
		);
	}

	if (!scheduleByDays || !scheduleByDays.length || !scheduleByDays[0] /* || !scheduleByDays[0].length */) {
		return (
			<>
				<BackBtn />

				<h1>{t("Student not found")(studentName)}</h1>
				<p>{t("Go back and search for a different one")}</p>
			</>
		);
	}

	return (
		<>
			{isDesktop ? (
				<SchedulePageDesktop match={match} />
			) : (
				<>
					<Navbar />

					<h1>{studentName}</h1>

					<DaySelector
						selectedDay={selectedDay}
						handleClick={(_e, day) => {
							// dispatchSelectedDayState({ day, causedBy: "daySelection" });

							navigateToDesiredPath({
								studentName,
								day: day,
								timeIndex: selectedLesson?.timeIndex,
								shouldShowTheLesson: !!selectedLesson || isDesktop,
							});
						}}
					/>

					<br />

					{/* {selectedDayState.day === "*" ? ( */}
					{selectedDay === "*" ? (
						scheduleByDays.map((lessonsArray, index) => (
							<div key={index} style={weekStyles}>
								<h3 style={{ padding: "1em 2em" }}>{t("weekday")(index)}</h3>

								<LessonsList
									lessons={lessonsArray}
									selectedDay={selectedDay}
									selectedLesson={null}
									handleClick={(_e, lesson) => {
										navigateToDesiredPath({
											studentName,
											day: selectedDay,
											timeIndex: lesson?.timeIndex,
											shouldShowTheLesson: !!lesson || isDesktop,
										});

										setSelectedLesson(lesson);
									}}
								/>
							</div>
						))
					) : (
						<>
							<LessonsList
								lessons={scheduleByDays[selectedDay]}
								selectedDay={selectedDay}
								// selectedLesson={null}
								selectedLesson={selectedLesson}
								handleClick={(_e, lesson) => {
									navigateToDesiredPath({
										studentName,
										day: selectedDay,
										timeIndex: lesson?.timeIndex,
										shouldShowTheLesson: !!lesson || isDesktop,
									});

									setSelectedLesson(lesson);
								}}
							/>
						</>
					)}

					<StudentListModal
						isOpen={!!selectedLesson}
						handleClose={() => {
							/**
							 * if we've been navigating normally, this will pop the current history
							 * back into the previous one, and the `replace` will do nothing.
							 *
							 * however, if we navigated directly through the URL,
							 * this would save us -- instead of going back to an empty tab,
							 * this will go back to where we're supposed to be at -- the selected day.
							 */
							// history.goBack();

							// history.replace(`/${studentName}/${encodeDay(selectedDay)}`);

							if (canGoBackInHistory.current) {
								history.goBack();
							} else {
								/**
								 * The goal here is to mimic the "go back" behavior as if the user
								 * did not come from an empty tab,
								 * additionally adding the `/` URL before the empty tab,
								 * and it looks something like this:
								 *
								 * [empty tab, /name/day/time] => [empty tab, /, /name/day, /name/day/time]
								 *             /\              =>                /\
								 */

								const newLocation1st: string = `/`;
								const newLocation2nd: string = `/${studentName}/${encodeDay(selectedDay)}`;
								const oldLocation3rd: string = history.location.pathname;

								history.replace(newLocation1st);

								history.push(newLocation2nd);

								history.push(oldLocation3rd);

								history.goBack();
							}

							setSelectedLesson(null);
						}}
						lesson={selectedLesson}
					/>

					<Footer />
				</>
			)}
		</>
	);
};

export default StudentSchedule;

/** TODO architect in such a way that we won't need this */
const encodeDay = (day: ScheduleDay) => (day === "*" ? "*" : Number(day) + 1);
const decodeDay = (day: number | "*"): ScheduleDay => (day === "*" ? "*" : ((day - 1) as ScheduleDay));

const encodeTimeIndex = (time: number): number => time + 1;
const decodeTimeIndex = (time: number | string): number => Number(time) - 1;

const navigateToDesiredPath = (data: {
	studentName: Student["text"];
	day?: ScheduleDay;
	timeIndex?: number;
	shouldShowTheLesson: boolean;
	replaceInsteadOfPush?: boolean /** should be used on the initial page load */;
}): void => {
	const path: string | undefined = getDesiredPath(data);

	console.log("path", `"${path}"`);

	if (!path) {
		return;
	}

	if (data.replaceInsteadOfPush) {
		history.replace(path);
		return;
	}

	history.push(path);
};

const getDesiredPath = ({
	studentName,
	day,
	timeIndex,
	shouldShowTheLesson /** shall be `false` on mobile unless the lesson was selected; always `true` on desktop */,
}: {
	studentName: Student["text"];
	day?: ScheduleDay;
	timeIndex?: number;
	shouldShowTheLesson: boolean;
}): string | undefined => {
	if (!studentName?.trim() || day === undefined) {
		return undefined;
	}

	const encodedDay = encodeDay(day);

	if (timeIndex === undefined || !shouldShowTheLesson) {
		// history.push(`/${studentName}/${encodedDay}`);
		return `/${studentName}/${encodedDay}`;
	}

	const encodedTimeIndex = encodeTimeIndex(timeIndex);

	// history.push(`/${studentName}/${encodedDay}/${encodedTimeIndex}`);
	return `/${studentName}/${encodedDay}/${encodedTimeIndex}`;
};
