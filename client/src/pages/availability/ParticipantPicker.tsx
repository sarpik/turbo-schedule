/* eslint-disable indent */

import React, {
	FC, //
	useCallback,
	PropsWithChildren,
	ReactElement,
	startTransition,
	useMemo,
} from "react";
import { css, cx } from "emotion";

import {
	createParticipantHierarchy, //
	Hierarchy,
	Participant,
	ParticipantHierarchyManual,
	WantedParticipant,
} from "@turbo-schedule/common";

import { SetStateArgs } from "../../utils/types";
import { Checkbox } from "../../common/Checkbox";
import { Indent } from "../../common/Indent";
import { useWindow } from "../../hooks/useWindow";
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
	setWantedParticipants: SetStateArgs<WantedParticipant[]>;
}

export const ParticipantPicker: FC<ParticipantPickerProps> = ({
	participants,
	wantedParticipants,
	setWantedParticipants: _setWantedParticipants,
}) => {
	const t = useTranslation();

	const hierarchy: ParticipantHierarchyManual = useMemo(
		() => createParticipantHierarchy(participants), //
		[participants]
	);

	return (
		<>
			<h1>{t("Participant picker")}</h1>

			{!hierarchy ? null : (
				<RecursiveParticipantHierarchy<WantedParticipant>
					hierarchy={hierarchy}
					wantedParticipants={wantedParticipants}
					setWantedParticipants={_setWantedParticipants}
				/>
			)}
		</>
	);
};

interface ParticipantSubsetPickerProps<T extends WantedParticipant = WantedParticipant> {
	participantSubset: T[];
	wantedParticipants: T[];
	setWantedParticipants: AllOrNothingCheckboxProps<T>["setWantedParticipants"];
	hasSelectedExtraInfo?: boolean;
	isSelectedStateOverride?: true | undefined;
}

function ParticipantSubsetPicker<T extends WantedParticipant = WantedParticipant>({
	participantSubset: fullParticipantSubset,
	wantedParticipants = [],
	setWantedParticipants,
	hasSelectedExtraInfo = false,
}: PropsWithChildren<ParticipantSubsetPickerProps<T>>): ReactElement | null {
	const getHowManyItemsPerRow = (totalItemCount: number, shouldFitIntoHowManyColumns: number): number =>
		Math.ceil(totalItemCount / shouldFitIntoHowManyColumns);

	const { desktop } = useWindow();

	const handleCheckboxClick = useCallback(
		(p: T) => (isSelected: boolean): void => {
			startTransition(() => {
				if (isSelected) {
					setWantedParticipants([...wantedParticipants, p]);
				} else {
					setWantedParticipants(wantedParticipants.filter((x) => x.text !== p.text));
				}
			});
		},
		[wantedParticipants, setWantedParticipants]
	);

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
					key={p.text}
					title={p.text}
					className={css`
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;

						/* cursor: pointer !important; */
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
						isSelectedStateOverride={wantedParticipants.map((wp) => wp.text).includes(p.text)}
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
						{p.text}
					</Checkbox>
				</li>
			))}
		</ul>
	);
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TopLevelSubsetProps<T extends WantedParticipant = WantedParticipant>
	extends Omit<AllOrNothingCheckboxProps<T>, "fullParticipantSubset" | "groupName" | "areAllParticipantsSelected"> {
	hierarchy: Hierarchy<unknown>; //
	wantedParticipants: T[];
}

function RecursiveParticipantHierarchy<T extends WantedParticipant = WantedParticipant>({
	hierarchy,
	wantedParticipants,
	setWantedParticipants,
}: PropsWithChildren<TopLevelSubsetProps<T>>): ReactElement | null {
	const checkAreAllSelected = useCallback(
		(): boolean =>
			hierarchy.currentItems.length > 0 &&
			hierarchy.currentItems.every((s) =>
				// eslint-disable-next-line no-whitespace-before-property
				wantedParticipants.map((p) => p.text).includes((s as WantedParticipant) /* TODO FIXME */.text)
			), // TODO FIXME
		[hierarchy.currentItems, wantedParticipants]
	);

	const areAllParticipantsSelected: boolean = checkAreAllSelected();

	const t = useTranslation();

	if (!hierarchy) {
		return null;
	}

	const groupName: string =
		hierarchy.groupName in en
			? (t((hierarchy.groupName as unknown) as keyof Dictionary) as string)
			: hierarchy.groupName;

	return (
		<article>
			<AllOrNothingCheckbox<T>
				groupName={groupName}
				areAllParticipantsSelected={areAllParticipantsSelected}
				setWantedParticipants={setWantedParticipants}
				fullParticipantSubset={hierarchy.currentItems as T[]} // TODO FIXME
			/>

			<Indent>
				{(hierarchy as any) /* TODO FIXME */?.children! ? (
					(hierarchy as any) /* TODO FIXME */
						.children!.map((child?: Hierarchy<unknown>) =>
							child && !child.currentItems?.length ? (
								<div>error - child with empty current items ({child.currentItems?.length}) </div>
							) : !child ? (
								<div>error - empty child!</div>
							) : (
								<RecursiveParticipantHierarchy<T>
									key={child.groupName}
									hierarchy={child}
									wantedParticipants={wantedParticipants}
									setWantedParticipants={setWantedParticipants}
								/>
							)
						)
				) : (
					<section>
						<ParticipantSubsetPicker<T>
							participantSubset={hierarchy.currentItems as T[]} // TODO FIXME
							wantedParticipants={wantedParticipants}
							setWantedParticipants={setWantedParticipants}
						/>
					</section>
				)}
			</Indent>
		</article>
	);
}

interface AllOrNothingCheckboxProps<T extends WantedParticipant = WantedParticipant> {
	groupName: string;
	areAllParticipantsSelected: boolean;
	fullParticipantSubset: T[];
	setWantedParticipants: SetStateArgs<T[]>;
}

function AllOrNothingCheckbox<T extends WantedParticipant = WantedParticipant>({
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
				handleClick={(isNowChecked: boolean): void => {
					if (isNowChecked) {
						setWantedParticipants((currentlyWantedParticipants) => [
							/**
							 * remove currently selected ones that are inside our `fullParticipantSubset`
							 * in case they overlap, and then add all of our `fullParticipantSubset`
							 * (ensures unique-ness)
							 */
							...currentlyWantedParticipants.filter(
								(wp) => !fullParticipantSubset.map((x) => x.text).includes(wp.text)
							),
							...fullParticipantSubset,
						]);
					} else {
						// setWantedParticipants([]);
						setWantedParticipants((currentlyWantedParticipants) =>
							currentlyWantedParticipants.filter(
								(wp) => !fullParticipantSubset.map((x) => x.text).includes(wp.text)
							)
						);
					}
				}}
			>
				{groupName}
			</Checkbox>
		</h2>
	);
}
