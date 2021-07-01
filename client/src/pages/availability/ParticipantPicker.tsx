import React, {
	FC,
	useCallback,
	useState,
	useEffect,
	useMemo,
	PropsWithChildren,
	ReactElement,
	startTransition,
} from "react";
import { css, cx } from "emotion";

import { parseParticipants, WantedParticipant } from "@turbo-schedule/common";

import { Checkbox } from "../../common/Checkbox";
import { Indent } from "../../common/Indent";
import { useWindow } from "../../hooks/useWindow";
import { TSetQuery, useQueryFor, arrayEncoderDecoder } from "../../hooks/useQueryFor";
import { useFetchParticipants } from "../../hooks/fetch/useFetchParticipants";
import { Dictionary } from "../../i18n/i18n";
import { useTranslation } from "../../i18n/useTranslation";

interface ParticipantPickerProps
	extends Omit<
		ParticipantSubsetPickerProps,
		| "participantSubset" //
		| "subsetTitle"
		| "wantedParticipants"
		| "setWantedParticipants"
	> {
	wantedParticipants: WantedParticipant[];
	setWantedParticipants: (newWantedParticipants: WantedParticipant[]) => void;
}

export const ParticipantPicker: FC<ParticipantPickerProps> = ({
	wantedParticipants,
	setWantedParticipants: _setWantedParticipants,
}) => {
	const t = useTranslation();

	const [participants] = useFetchParticipants();

	const {
		students, //
		teachers,
		classes,
		rooms,
	} = useMemo(
		() => parseParticipants(participants), //
		[participants]
	);

	/**
	 * WARNING - BAD CODE AHEAD
	 * TODO FIXME
	 */

	const [wantedStudents, setWantedStudents] = useQueryFor<string[]>(
		"students",
		useMemo(
			() => ({
				...arrayEncoderDecoder,
				valueOverrideOnceChanges: arrayEncoderDecoder.encode(
					wantedParticipants.filter((p) => p.labels[0] === "student").map((p) => p.text)
				),
			}),
			[wantedParticipants]
		)
	);
	const [wantedTeachers, setWantedTeachers] = useQueryFor<string[]>(
		"teachers",
		useMemo(
			() => ({
				...arrayEncoderDecoder,
				valueOverrideOnceChanges: arrayEncoderDecoder.encode(
					wantedParticipants.filter((p) => p.labels[0] === "teacher").map((p) => p.text)
				),
			}),
			[wantedParticipants]
		)
	);
	const [wantedClasses, setWantedClasses] = useQueryFor<string[]>(
		"classes",
		useMemo(
			() => ({
				...arrayEncoderDecoder,
				valueOverrideOnceChanges: arrayEncoderDecoder.encode(
					wantedParticipants.filter((p) => p.labels[0] === "class").map((p) => p.text)
				),
			}),
			[wantedParticipants]
		)
	);
	const [wantedRooms, setWantedRooms] = useQueryFor<string[]>(
		"rooms",
		useMemo(
			() => ({
				...arrayEncoderDecoder,
				valueOverrideOnceChanges: arrayEncoderDecoder.encode(
					wantedParticipants.filter((p) => p.labels[0] === "room").map((p) => p.text)
				),
			}),
			[wantedParticipants]
		)
	);

	const renderables = [
		[students, wantedStudents, setWantedStudents, "Students"],
		[teachers, wantedTeachers, setWantedTeachers, "Teachers"],
		[classes, wantedClasses, setWantedClasses, "Classes"],
		[rooms, wantedRooms, setWantedRooms, "Rooms"],
	] as const;

	// useEffect(() => {
	// 	setWantedStudents(wantedParticipants.filter((p) => p.labels[0] === "student").map((p) => p.text));
	// 	setWantedTeachers(wantedParticipants.filter((p) => p.labels[0] === "teacher").map((p) => p.text));
	// 	setWantedClasses(wantedParticipants.filter((p) => p.labels[0] === "class").map((p) => p.text));
	// 	setWantedRooms(wantedParticipants.filter((p) => p.labels[0] === "room").map((p) => p.text));
	// }, [wantedParticipants, setWantedStudents, setWantedTeachers, setWantedClasses, setWantedRooms]);

	useEffect(() => {
		// const wantedParticipants: string[] = [...wantedStudents, ...wantedTeachers, ...wantedClasses, ...wantedRooms];
		// handleChange(wantedParticipants);
		const newWantedParticipants: WantedParticipant[] = [
			...wantedStudents.map((p): WantedParticipant => ({ text: p, labels: ["student"] })),
			...wantedTeachers.map((p): WantedParticipant => ({ text: p, labels: ["teacher"] })),
			...wantedClasses.map((p): WantedParticipant => ({ text: p, labels: ["class", "student"] })),
			...wantedRooms.map((p): WantedParticipant => ({ text: p, labels: ["room"] })),
		];

		_setWantedParticipants(newWantedParticipants);
	}, [_setWantedParticipants, wantedStudents, wantedTeachers, wantedClasses, wantedRooms]);

	const setAllOrNothingWantedParticipants = useCallback(
		(newWantedParticipants: WantedParticipant[]) => {
			const isChecked: boolean = newWantedParticipants.length > 0;

			if (isChecked) {
				setWantedStudents(students);
				setWantedTeachers(teachers);
				setWantedClasses(classes);
				setWantedRooms(rooms);
			} else {
				setWantedStudents([]);
				setWantedTeachers([]);
				setWantedClasses([]);
				setWantedRooms([]);
			}
		},
		[
			//
			students,
			setWantedStudents,
			teachers,
			setWantedTeachers,
			classes,
			setWantedClasses,
			rooms,
			setWantedRooms,
		]
	);

	/**
	 * naive way.
	 * TODO optimize - this work is already done inside `ParticipantSubsetPicker`s,
	 * we should use their `AllOrNothingCheckbox` selected/not selected state.
	 */
	const checkAreAllSelected = useCallback(
		() =>
			students.length + teachers.length + classes.length + rooms.length > 0 && //
			students.every((p) => wantedStudents.includes(p)) &&
			teachers.every((p) => wantedTeachers.includes(p)) &&
			classes.every((p) => wantedClasses.includes(p)) &&
			rooms.every((p) => wantedRooms.includes(p)),
		[students, wantedStudents, teachers, wantedTeachers, classes, wantedClasses, rooms, wantedRooms]
	);

	/**
	 * duplicate logic with the `subset` component.
	 * perhaps we should not use `parseParticipants` and use labels
	 * to filter real-time to avoid having to sync the different types
	 * of participants. will see.
	 */
	const [areAllParticipantsSelected, setAreAllParticipantsSelected] = useState<boolean>(checkAreAllSelected());

	useEffect(() => {
		const areAll = checkAreAllSelected();
		console.log("areAll", areAll);
		setAreAllParticipantsSelected(areAll);
	}, [checkAreAllSelected]);

	return (
		<>
			<h1>{t("Participant picker")}</h1>

			<TopLevelSubset<WantedParticipant>
				subsetTitle="Everyone"
				fullParticipantSubset={participants}
				setWantedParticipants={setAllOrNothingWantedParticipants}
				areAllParticipantsSelected={areAllParticipantsSelected}
			>
				<section>
					{renderables.map(([fullSubset, wanted, setWanted, title]) => (
						<ParticipantSubsetPicker
							key={title}
							subsetTitle={title}
							participantSubset={fullSubset} //
							wantedParticipants={wanted}
							setWantedParticipants={setWanted}
							isSelectedStateOverride={areAllParticipantsSelected || undefined}
						/>
					))}
				</section>
			</TopLevelSubset>
		</>
	);
};

interface ParticipantSubsetPickerProps {
	participantSubset: string[];
	wantedParticipants: string[];
	setWantedParticipants: TSetQuery<string[]>;
	subsetTitle: Extract<keyof Dictionary, "Everyone" | "Students" | "Teachers" | "Classes" | "Rooms">;
	hasSelectedExtraInfo?: boolean;
	isSelectedStateOverride?: true | undefined;
}

export const ParticipantSubsetPicker: FC<ParticipantSubsetPickerProps> = ({
	subsetTitle,
	participantSubset: fullParticipantSubset,
	wantedParticipants = [],
	setWantedParticipants,
	hasSelectedExtraInfo = false,
	isSelectedStateOverride = undefined,
}) => {
	const getHowManyItemsPerRow = (totalItemCount: number, shouldFitIntoHowManyColumns: number): number =>
		Math.ceil(totalItemCount / shouldFitIntoHowManyColumns);

	const { desktop } = useWindow();

	const handleCheckboxClick = useCallback(
		(p) => (isSelected: boolean): void => {
			startTransition(() => {
				if (isSelected) {
					setWantedParticipants([...wantedParticipants, p]);
				} else {
					setWantedParticipants(wantedParticipants.filter((x) => x !== p));
				}
			});
		},
		[wantedParticipants, setWantedParticipants]
	);

	const checkAreAllSelected = useCallback(
		(): boolean =>
			isSelectedStateOverride || //
			(fullParticipantSubset.length > 0 && fullParticipantSubset.every((s) => wantedParticipants.includes(s))),
		[isSelectedStateOverride, fullParticipantSubset, wantedParticipants]
	);

	const [areAllParticipantsSelected, setAreAllParticipantsSelected] = useState<boolean>(checkAreAllSelected());

	useEffect(() => {
		setAreAllParticipantsSelected(checkAreAllSelected());
	}, [checkAreAllSelected]);

	return (
		<TopLevelSubset
			subsetTitle={subsetTitle}
			areAllParticipantsSelected={areAllParticipantsSelected}
			setWantedParticipants={setWantedParticipants}
			fullParticipantSubset={fullParticipantSubset}
		>
			<ul
				className={cx(
					css`
						display: grid;
						grid-auto-flow: column;

						grid-template-rows: repeat(${getHowManyItemsPerRow(fullParticipantSubset.length, 2)}, 1fr);

						${desktop} {
							grid-template-rows: repeat(
								${getHowManyItemsPerRow(fullParticipantSubset.length, hasSelectedExtraInfo ? 4 : 6)},
								1fr
							);
						}

						text-align: left;
					`
				)}
			>
				{fullParticipantSubset.map((p) => (
					<li
						key={p}
						title={p}
						className={css`
							white-space: nowrap;
							text-overflow: ellipsis;
							overflow: hidden;
						`}
					>
						<Checkbox
							labelStyles={css`
								display: inline-block;
								/* display: inline; */
								width: 100%;

								white-space: nowrap;
								text-overflow: ellipsis;
								overflow: hidden;
							`}
							spanStyles={css``}
							isSelectedStateOverride={wantedParticipants.includes(p)}
							handleClick={handleCheckboxClick(p)}
							// left={
							// 	<details
							// 		className={css`
							// 			display: inline-block;
							// 		`}
							// 	>
							// 		{/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
							// 		<summary />

							// 		<div>relatives and stuff</div>
							// 	</details>
							// }
						>
							{p}
						</Checkbox>
					</li>
				))}
			</ul>
		</TopLevelSubset>
	);
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TopLevelSubsetProps<T = string> extends AllOrNothingCheckboxProps<T> {
	//
}

function TopLevelSubset<T = string>({
	children, //
	areAllParticipantsSelected,
	setWantedParticipants,
	fullParticipantSubset,
	subsetTitle,
}: PropsWithChildren<TopLevelSubsetProps<T>>): ReactElement | null {
	return (
		<article>
			<AllOrNothingCheckbox<T>
				subsetTitle={subsetTitle}
				areAllParticipantsSelected={areAllParticipantsSelected}
				setWantedParticipants={setWantedParticipants}
				fullParticipantSubset={fullParticipantSubset}
			/>

			<Indent>{children}</Indent>
		</article>
	);
}

interface AllOrNothingCheckboxProps<T = string> {
	subsetTitle: Extract<keyof Dictionary, "Everyone" | "Students" | "Teachers" | "Classes" | "Rooms">;
	areAllParticipantsSelected: boolean;
	fullParticipantSubset: T[];
	setWantedParticipants: (newWantedParticipants: T[]) => void;
}

function AllOrNothingCheckbox<T = string>({
	subsetTitle,
	areAllParticipantsSelected, //
	setWantedParticipants,
	fullParticipantSubset,
}: PropsWithChildren<AllOrNothingCheckboxProps<T>>): ReactElement | null {
	const t = useTranslation();

	return (
		<h2
			className={css`
				text-align: left;
			`}
		>
			<Checkbox
				flex
				isSelectedStateOverride={areAllParticipantsSelected}
				handleClick={(areAllSelected: boolean): void => {
					if (areAllSelected) {
						setWantedParticipants(fullParticipantSubset);
					} else {
						setWantedParticipants([]);
					}
				}}
			>
				{t(subsetTitle)}
			</Checkbox>
		</h2>
	);
}
