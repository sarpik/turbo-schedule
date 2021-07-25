/* eslint-enable indent */

import React, { FC, useCallback, PropsWithChildren, ReactElement, startTransition } from "react";
import { css, cx } from "emotion";

import {
	createParticipantHierarchy,
	Hierarchy,
	Participant,
	ParticipantHierarchy,
	WantedParticipant,
} from "@turbo-schedule/common";

import { Checkbox } from "../../common/Checkbox";
import { Indent } from "../../common/Indent";
import { useWindow } from "../../hooks/useWindow";
import { TSetQuery } from "../../hooks/useQueryFor";
import { Dictionary, en } from "../../i18n/i18n";
import { useTranslation } from "../../i18n/useTranslation";

interface ParticipantPickerProps
	extends Omit<
		ParticipantSubsetPickerProps,
		| "participantSubset" //
		| "subsetTitle"
		| "wantedParticipants"
		| "setWantedParticipants"
	> {
	participants: Participant[];
	wantedParticipants: WantedParticipant[];
	setWantedParticipants: (newWantedParticipants: WantedParticipant[]) => void;
}

export const ParticipantPicker: FC<ParticipantPickerProps> = ({
	participants,
	wantedParticipants,
	setWantedParticipants: _setWantedParticipants,
}) => {
	const t = useTranslation();

	const hierarchy: ParticipantHierarchy = createParticipantHierarchy(participants)[0];
	console.log("hierarchy", hierarchy);
	// const aaaaa = hierarchy.children[0].children[0].currentItems;
	// const a = "children" in hierarchy.children[2];

	return (
		<>
			<h1>{t("Participant picker")}</h1>

			{!hierarchy ? null : (
				// <AllOrNothingCheckboxWithIndentedChildren<WantedParticipant>
				<RecursiveParticipantHierarchy<Participant>
					fullParticipantSubset={hierarchy.currentItems}
					hierarchy={hierarchy as any} // TODO FIXME
					wantedParticipants={wantedParticipants}

					// groupName="Everyone"
					// fullParticipantSubset={participants}
					// setWantedParticipants={setAllOrNothingWantedParticipants}
					// areAllParticipantsSelected={areAllParticipantsSelected}
				/>
			)}
		</>
	);
};

interface ParticipantSubsetPickerProps {
	participantSubset: string[];
	wantedParticipants: string[];
	setWantedParticipants: TSetQuery<string[]>;
	// subsetTitle: Extract<keyof Dictionary, "Everyone" | "Students" | "Teachers" | "Classes" | "Rooms">;
	hasSelectedExtraInfo?: boolean;
	isSelectedStateOverride?: true | undefined;
}

export const ParticipantSubsetPicker: FC<ParticipantSubsetPickerProps> = ({
	// subsetTitle,
	participantSubset: fullParticipantSubset,
	wantedParticipants = [],
	setWantedParticipants,
	hasSelectedExtraInfo = false,
	// isSelectedStateOverride = undefined,
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

	// const checkAreAllSelected = useCallback(
	// 	(): boolean =>
	// 		isSelectedStateOverride || //
	// 		(fullParticipantSubset.length > 0 && fullParticipantSubset.every((s) => wantedParticipants.includes(s))),
	// 	[isSelectedStateOverride, fullParticipantSubset, wantedParticipants]
	// );

	return (
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
	);
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TopLevelSubsetProps<T = string> extends Omit<AllOrNothingCheckboxProps<T>, "fullParticipantSubset"> {
	hierarchy: Hierarchy<unknown>; //
	wantedParticipants: WantedParticipant[];
};

function RecursiveParticipantHierarchy<T = string>({
	hierarchy,
	wantedParticipants,
}: PropsWithChildren<TopLevelSubsetProps<T>>): ReactElement | null {
	const checkAreAllSelected = useCallback(
		(): boolean =>
			hierarchy.currentItems.length > 0 && hierarchy.currentItems.every((s) => wantedParticipants.includes(s)),
		[hierarchy.currentItems, wantedParticipants]
	);

	const areAllParticipantsSelected: boolean = checkAreAllSelected();

	const setWantedParticipants = () => -1; // TODO

	const t = useTranslation();

	const groupName: string =
			(hierarchy.groupName in en) ? t((hierarchy.groupName as unknown) as keyof Dictionary) as string : hierarchy.groupName;
	// [hierarchy.groupName]
	// )

	return (
		<article>
			<AllOrNothingCheckbox<T>
				getGroupName={groupName}
				// groupName={hierarchy.groupName}
				areAllParticipantsSelected={areAllParticipantsSelected}
				setWantedParticipants={setWantedParticipants}
				fullParticipantSubset={hierarchy.currentItems as T[]} // TODO FIXME
			/>

			<Indent>
				{hierarchy.children ? (
					hierarchy.children!.map((child) => (
						<RecursiveParticipantHierarchy
							hierarchy={child}
							wantedParticipants={wantedParticipants}
						/>
					))
				) : (
					<section>
						<ParticipantSubsetPicker
							// key={item.id}
							// subsetTitle={item.}
							participantSubset={hierarchy.currentItems} //
							wantedParticipants={wantedParticipants}
							setWantedParticipants={setWantedParticipants}
							// isSelectedStateOverride={areAllParticipantsSelected || undefined}
						/>
					</section>
				)}
			</Indent>
		</article>
	);
}

interface AllOrNothingCheckboxProps<T = string> {
	// groupName:  Extract<keyof Dictionary, "Everyone" | "Students" | "Teachers" | "Classes" | "Rooms">;
	groupName: string;
	areAllParticipantsSelected: boolean;
	fullParticipantSubset: T[];
	setWantedParticipants: (newWantedParticipants: T[]) => void;
}

function AllOrNothingCheckbox<T = string>({
	groupName,
	areAllParticipantsSelected, //
	setWantedParticipants,
	fullParticipantSubset,
}: PropsWithChildren<AllOrNothingCheckboxProps<T>>): ReactElement | null {

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
				{groupName}
			</Checkbox>
		</h2>
	);
}
