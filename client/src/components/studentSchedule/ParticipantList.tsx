/* eslint-disable react/prop-types */

import React, { FC } from "react";
import { css } from "emotion";

import { Student, Teacher, Room, Class, Participant, parseParticipants } from "@turbo-schedule/common";

import { Link } from "react-router-dom";
// import { usePersistedLRUCache } from "hooks/useLRUCache";
import {
	// useMostRecentlyViewedStudents,
	// useMostRecentlyViewedClasses,
	// useMostRecentlyViewedTeachers,
	// useMostRecentlyViewedRooms,
	useMostRecentlyViewedParticipants,
} from "hooks/useLRUCache";
import { Dictionary } from "i18n/i18n";
import { useTranslation } from "../../i18n/useTranslation";
import { createLinkToLesson } from "./LessonsList";

interface Props {
	participants:
		| Participant[]
		| {
				students: Student["text"][];
				teachers: Teacher["text"][];
				rooms: Room["text"][];
				classes: Class["text"][];
		  };
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

	// const [mostRecentlyViewedStudents] = useMostRecentlyViewedStudents();
	// const [mostRecentlyViewedClasses] = useMostRecentlyViewedClasses();
	// const [mostRecentlyViewedTeachers] = useMostRecentlyViewedTeachers();
	// const [mostRecentlyViewedRooms] = useMostRecentlyViewedRooms();
	const [mostRecentlyViewedParticipants] = useMostRecentlyViewedParticipants();

	const renderables: { k: keyof Dictionary; v: string[] }[] = [
		{ k: "Students", v: students },
		{ k: "Teachers", v: teachers },
		{ k: "Rooms", v: rooms },
		{ k: "Classes", v: classes },
		{ k: "Recently viewed (adj, mult)", v: [...mostRecentlyViewedParticipants].reverse() },
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
			{renderables.map(({ k: summary, v: theParticipants }) => (
				<ParticipantList
					participants={theParticipants}
					summary={t(summary) + ` (${theParticipants.length})`}
					isOnlyOneMatchingParticipant={isOnlyOneMatchingParticipant}
				/>
			))}
		</div>
	);
};

const ParticipantList: FC<{
	participants: string[];
	summary?: string;
	open?: boolean;
	isOnlyOneMatchingParticipant?: boolean;
}> = ({ participants = [], summary = "", open = true, isOnlyOneMatchingParticipant = false }) => (
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
			{participants.map((p) => (
				<ParticipantListItem participant={p} isOnlyOneMatchingParticipant={isOnlyOneMatchingParticipant} />
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
