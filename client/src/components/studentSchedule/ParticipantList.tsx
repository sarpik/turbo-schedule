/* eslint-disable react/prop-types */

import React, { FC } from "react";
import { css } from "emotion";

import { Student, Teacher, Room, Class, Participant, parseParticipants } from "@turbo-schedule/common";

import { Link } from "react-router-dom";

import { useMostRecentlyViewedParticipantsSplit } from "../../hooks/useLRUCache";
import { Dictionary } from "../../i18n/i18n";
import { useTranslation } from "../../i18n/useTranslation";
import { createLinkToLesson } from "./LessonsList";

type MehParticipants = {
	students: Student["text"][];
	teachers: Teacher["text"][];
	rooms: Room["text"][];
	classes: Class["text"][];
};

interface Props {
	participants: Participant[] | MehParticipants;
	className?: string;
}

export const ParticipantListList: FC<Props> = ({ participants, className, ...rest }) => {
	const t = useTranslation();

	console.log("participants", participants);

	const { students, teachers, rooms, classes } = Array.isArray(participants)
		? parseParticipants(participants)
		: participants;

	const isOnlyOneMatchingParticipant: boolean =
		students.length + teachers.length + rooms.length + classes.length === 1;

	const {
		mostRecentStudents, //
		mostRecentTeachers,
		mostRecentRooms,
		mostRecentClasses,
	} = useMostRecentlyViewedParticipantsSplit();

	const renderables: { k: keyof Dictionary; v: string[]; recent: string[] }[] = [
		{
			k: "Students",
			v: students,
			recent: mostRecentStudents.filter(
				(x) =>
					participants?.map?.((p) => p.text).filter((p) => p.includes(x)) ??
					Object.values(participants as MehParticipants)
						.flat()
						.includes(x)
			),
		},
		{
			k: "Teachers",
			v: teachers,
			recent: mostRecentTeachers.filter(
				(x) =>
					participants?.map?.((p) => p.text).filter((p) => p.includes(x)) ??
					Object.values(participants as MehParticipants)
						.flat()
						.includes(x)
			),
		},
		{
			k: "Rooms",
			v: rooms,
			recent: mostRecentRooms.filter(
				(x) =>
					participants?.map?.((p) => p.text).filter((p) => p.includes(x)) ??
					Object.values(participants as MehParticipants)
						.flat()
						.includes(x)
			),
		},
		{
			k: "Classes",
			v: classes,
			recent: mostRecentClasses.filter(
				(x) =>
					participants?.map?.((p) => p.text).filter((p) => p.includes(x)) ??
					Object.values(participants as MehParticipants)
						.flat()
						.includes(x)
			),
		},
		// {
		// 	k: "Recently viewed (adj, mult)",
		// 	v: mostRecentlyViewedParticipants.filter(
		// 		(recentP) =>
		// 			(participants as Participant[])?.map?.((p) => p.text).includes(recentP) ??
		// 			Object.values(participants as MehParticipants)
		// 				.flat()
		// 				.includes(recentP)
		// 	),
		// },
	];

	return (
		<div
			className={[
				css`
					display: grid;

					grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
					font-size: 0.75em;

					& > * + * {
						margin-top: 2rem;
					}
				`,
				className,
			].join(" ")}
			{...rest}
		>
			{renderables.map(({ k: summary, v: theParticipants, recent }) => (
				<ParticipantList
					key={summary}
					participants={theParticipants}
					mostRecentParticipants={recent}
					summary={t(summary) + ` (${theParticipants.length})`}
					isOnlyOneMatchingParticipant={isOnlyOneMatchingParticipant}
				/>
			))}
		</div>
	);
};

const ParticipantList: FC<{
	participants: string[];
	mostRecentParticipants?: string[];
	summary?: string;
	open?: boolean;
	isOnlyOneMatchingParticipant?: boolean;
}> = ({
	participants = [], //
	mostRecentParticipants = [],
	summary = "",
	open = true,
	isOnlyOneMatchingParticipant = false,
}) => (
	<details
		className={css`
			margin-left: auto;
			margin-right: auto;

			text-align: left;
			font-size: 1.5em;

			outline: none;
		`}
		open={!!open}
	>
		{!!summary && (
			<summary
				className={css`
					cursor: pointer;

					outline: none;
				`}
			>
				<span>{summary}</span>
			</summary>
		)}

		<ol
			type="1"
			className={css`
				display: flex;
				flex-direction: column;

				& > * {
					list-style-type: decimal-leading-zero;
				}

				& > * + * {
					margin-top: 0.25em;
				}
			`}
		>
			{mostRecentParticipants.map((p) => (
				<ParticipantListItem
					key={p} //
					participant={p}
					isOnlyOneMatchingParticipant={isOnlyOneMatchingParticipant}
				/>
			))}
		</ol>

		<ol
			type="1"
			className={css`
				display: flex;
				flex-direction: column;

				& > * {
					list-style-type: decimal-leading-zero;
				}

				& > * + * {
					margin-top: 0.25em;
				}
			`}
		>
			{participants.map((p) => (
				<ParticipantListItem
					key={p} //
					participant={p}
					isOnlyOneMatchingParticipant={isOnlyOneMatchingParticipant}
				/>
			))}
		</ol>
	</details>
);

export const ParticipantListItem: FC<{
	participant: string;
	isOnlyOneMatchingParticipant?: boolean;
	dayIndex?: number;
	timeIndex?: number;
	highlightInsteadOfOpen?: boolean;
}> = ({
	participant, //
	isOnlyOneMatchingParticipant = false,
	dayIndex,
	timeIndex,
	highlightInsteadOfOpen = true,
	children,
}) => (
	<li
		key={participant}
		className={css`
			${isOnlyOneMatchingParticipant && "font-weight: 600; font-size: 1.69rem;"}
		`}
	>
		<Link
			to={createLinkToLesson(participant, dayIndex, timeIndex, highlightInsteadOfOpen)}
			className={css`
				${isOnlyOneMatchingParticipant && "border-bottom: 3px solid #000;"}
			`}
		>
			{participant}
			{children}
		</Link>
	</li>
);
