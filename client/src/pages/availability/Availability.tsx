/* eslint-disable indent, no-multi-str, flowtype/space-after-type-colon */

import React, { FC, useState, useEffect, useRef, useReducer, useCallback, useMemo, startTransition } from "react";
import axios from "axios";
import { cx, css } from "emotion";

import { Availability as IAvailability, Participant, WantedParticipant } from "@turbo-schedule/common";

import { useFetchParticipants } from "../../hooks/fetch/useFetchParticipants";
import { ParticipantListItem } from "../../components/studentSchedule/ParticipantList";
import { Dictionary } from "../../i18n/i18n";
import { useWindow } from "../../hooks/useWindow";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useQueryFor, EncoderDecoder, arrayEncoderDecoder } from "../../hooks/useQueryFor";
import { Navbar } from "../../components/navbar/Navbar";
import { useTranslation } from "../../i18n/useTranslation";
import { ParticipantPicker } from "./ParticipantPicker";

const mapRatioToHSLThroughHue = (ratio: number, hueStart: number = 240, hueEnd: number = 360): string => {
	const hue: number = hueStart + (hueEnd - hueStart) * ratio;

	const saturation: number = 100;

	const lightness: number = 50;
	// const lightness: number =
	// 	ratio > 0.5
	// 		? 50 + 10 * ratio //
	// 		: 50 - 10 * ratio;

	const alpha: number = 1 - ratio + 0.1;
	// ratio > 0.5
	// 	? 50 + 10 * ratio //
	// 	: 50 - 10 * ratio;

	return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
};

const mapRatioToHSBThroughBrightness = (ratio: number, start: number = 0, end: number = 1): string => {
	const hue: number = 120; // hueStart + (hueEnd - hueStart) * ratio;

	const saturation: number = 0;
	// const saturation: number = start + (end - start) * ratio;
	const lightness: number = 40 * ratio;

	// const lightness: number =
	// 	ratio > 0.5
	// 		? start - (end - start) * ratio //
	// 		: start + (end - start) * ratio;

	const alpha: number = start + (end - start) * ratio;

	return `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.max(0.05, 1 - alpha)})`;
};

export const Availability: FC = () => {
	const t = useTranslation();

	const invalidEnDeVal = -1;
	const ende: EncoderDecoder<number> = useMemo(
		() => ({
			encode: (x) => (x === invalidEnDeVal ? "" : x.toString()), //
			decode: (x) => (!x ? invalidEnDeVal : Number(x)),
		}),
		[invalidEnDeVal]
	);
	const [selectedDay, setSelectedDay] = useQueryFor("day", ende);
	const [selectedTime, setSelectedTime] = useQueryFor("time", ende);

	const hasSelectedExtraInfo: boolean =
		/* wantedParticipants.length === 0 ? false : */
		[selectedDay, selectedTime].some((x) => x !== invalidEnDeVal);

	type TDisplayType = "+-=" | "available / total" | "bussy / total" | "mapped ratio to HSL";

	const [displayType] = useState<TDisplayType>("mapped ratio to HSL");

	const [availability, setAvailability] = useState<IAvailability[][]>([]);

	const selectedAvailability: IAvailability = useMemo(() => availability?.[selectedDay]?.[selectedTime] ?? null, [
		availability,
		selectedDay,
		selectedTime,
	]);
	const setSelectedAvailability = useCallback(
		(dayIndex: number, timeIndex: number): void => {
			setSelectedDay(dayIndex);
			setSelectedTime(timeIndex);
		},
		[setSelectedDay, setSelectedTime]
	);
	const unselectAvailability = useCallback(() => {
		setSelectedDay(invalidEnDeVal);
		setSelectedTime(invalidEnDeVal);
	}, [setSelectedDay, setSelectedTime, invalidEnDeVal]);

	const availabilityGridRef = useRef<HTMLDivElement>(null);

	/** begin bussy/available button indication */
	interface IColorMapperEntry {
		name: string;
		descriptionAccessor: keyof Dictionary;
		gradient: string;
		fn: (ratio: number, rangeStart?: number, rangeEnd?: number) => string;
	}

	const colorMapperEntrys: IColorMapperEntry[] = [
		{
			name: "black-white",
			descriptionAccessor: "white - bussy; black - available",
			gradient: "linear-gradient(to right, hsl(0, 0%, 90%), hsl(0, 0%, 10%))",
			fn: mapRatioToHSBThroughBrightness,
		},
		{
			name: "red-blue",
			descriptionAccessor: "red - bussy; blue - available",
			gradient: "linear-gradient(to right, hsl(360, 100%, 50%), hsl(240, 100%, 50%))",
			fn: mapRatioToHSLThroughHue,
		},
	];

	const [colorMapperName, setColorMapperName] = useLocalStorage("colorMapperName", colorMapperEntrys[0].name);

	// const [colorMapperEntry, setcolorMapperEntry] = useReducer<IColorMapperEntry[], IColorMapperEntry["name"]>(
	const [colorMapperEntry, updatecolorMapperEntry] = useReducer((prevState) => {
		if (prevState.name === "black-white") {
			setColorMapperName(colorMapperEntrys[1].name);
			return colorMapperEntrys[1];
		} else if (prevState.name === "red-blue") {
			setColorMapperName(colorMapperEntrys[0].name);
			return colorMapperEntrys[0];
		}

		setColorMapperName(colorMapperEntrys[0].name);
		return colorMapperEntrys[0];
	}, colorMapperEntrys.filter((e) => e.name === colorMapperName)?.[0] ?? colorMapperEntrys[0]);
	/** end bussy/available button indication */

	const { desktop, notDesktop } = useWindow();

	const [participants] = useFetchParticipants();

	const [wantedParticipants, __setWantedParticipants] = useQueryFor<WantedParticipant[]>("p", {
		/**
		 * re-run once the dependencies change
		 */
		dependencies: [participants],
		encode: (wps: WantedParticipant[]) => arrayEncoderDecoder.encode(wps.map((wp) => wp.text)),
		decode: (participantsString: string) => {
			/**
			 * return an empty array, since we need the `participants`
			 * before doing anything.
			 *
			 * hence, we've listed the `participants` in the `dependencies` array
			 *
			 */
			if (!participants.length) {
				return [];
			}

			const participantStrings: string[] = arrayEncoderDecoder.decode(participantsString);
			const participantsTbd: (Participant | undefined)[] = participantStrings.map((participantStr) =>
				participants.find((participant) => participant.text === participantStr)
			);

			if (participantsTbd.includes(undefined)) {
				/**
				 * TODO FIXME - add information pop-up to the user
				 * to inform about which users were missing!
				 */

				throw new Error("fetched participants did not include a wanted participant from the URL query");
			}

			const wps: WantedParticipant[] = (participantsTbd as Participant[]).map((wp) => ({
				text: wp.text,
				labels: wp.labels,
			}));

			return wps;
		},
	});

	const [hasHadAChanceToUpdateWantedParticipants, setHasHadAChanceToUpdateWantedParticipants] = useState(false);

	useEffect(() => {
		if (participants.length) {
			setHasHadAChanceToUpdateWantedParticipants(true);
		}
	}, [participants, wantedParticipants]);

	const setWantedParticipants = useCallback(
		(
			newWantedParticipants:
				| WantedParticipant[]
				| ((currentlyWantedParticipants: WantedParticipant[]) => WantedParticipant[])
		): void => {
			startTransition(() => {
				if (typeof newWantedParticipants === "function") {
					__setWantedParticipants(newWantedParticipants(wantedParticipants));
				} else {
					__setWantedParticipants(newWantedParticipants);
				}
			});
		},
		[__setWantedParticipants, wantedParticipants]
	);

	useEffect(() => {
		if (!wantedParticipants?.length) {
			/**
			 * if the query was empty,
			 * reset the time & date params (thus, the "hasSelectedExtraInfo" too),
			 * freeing up screen space for a wider participant picker
			 */

			if (hasHadAChanceToUpdateWantedParticipants) {
				/**
				 * only resets the params if it's not the first mount
				 *
				 * technically it's not the first/non-first mount,
				 * the point is is that the `wantedParticipants` have had a chance by now
				 * to get updated from the `ParticipantPicker`s url queries `students`, `teachers`, `classes` & `rooms`,
				 * and thus if there were some selected participants - we do not want to remove
				 * the selected day & time, and if there were 0 selected participants - we do want to remove,
				 * which is what we're doing here:
				 */

				setSelectedDay(invalidEnDeVal);
				setSelectedTime(invalidEnDeVal);
			}

			setAvailability([]);

			return;
		}

		const wantedParticipantsPrepared: string = wantedParticipants
			.map((wp) => wp.text.trim())
			.filter((wp) => !!wp)
			.join(",");

		const url: string = `/api/v1/participant/common-availability?wanted-participants=${wantedParticipantsPrepared}`;

		let isCancelled: boolean = false;

		axios
			.get<{ availability: IAvailability[][] }>(url)
			.then((res) => {
				if (!isCancelled) setAvailability(res?.data?.availability ?? []);
			})
			.catch((e) => console.error(e));

		return (): void => {
			isCancelled = true;
		};
	}, [
		wantedParticipants,
		invalidEnDeVal,
		setSelectedDay,
		setSelectedTime,
		setAvailability,
		participants,
		hasHadAChanceToUpdateWantedParticipants,
	]);

	return (
		<>
			<Navbar />

			<main
				className={cx(
					css`
						display: grid;

						grid-template-columns: repeat(3, 1fr);
						grid-template-rows: minmax(2em, autofit);

						margin-top: 2em;

						grid-template-areas:
							"info info info"
							"select select select"
							"display display display"
							"detailed-info detailed-info detailed-info";

						${notDesktop} {
							& > * + * {
								margin-top: 2em;
							}
						}

						${desktop} {
							grid-template-areas: ${hasSelectedExtraInfo
								? '	"info info info" \
									"select display detailed-info" \
									"select display detailed-info"; '
								: '	"info info info" \
									"select select display" \
									"select select display"; '};

							/* the 'detailed-info' grid-area is hidden below if it has not been selected */
						}
					`
				)}
			>
				<section
					className={css`
						grid-area: info;
					`}
				>
					{/* <h1>{t("Common Availability")}</h1> */}

					<h2
						className={css`
							margin-left: 1em;
							margin-right: 1em;

							max-width: 60ch;
							margin: auto;

							font-weight: normal;
						`}
					>
						{t(
							"There're often situations when you have a group of people and want to find a common time to meet"
						)}
						{". "}
						<i
							className={css`
								white-space: nowrap;
							`}
						>
							{t("Common Availability")}
						</i>{" "}
						{t("is exactly the tool you need")}!
					</h2>
				</section>

				{/* availability display */}
				<section
					className={css`
						grid-area: display;

						margin-top: 4em;

						& > * + * {
							margin-top: 2em;
						}
					`}
				>
					{availability.length ? (
						<div
							className={css`
								display: flex;
								flex-direction: column;

								justify-content: center;
								align-items: center;
							`}
						>
							<div>
								<div
									className={css`
										/* width: 100%; */
										width: ${availabilityGridRef.current?.getBoundingClientRect().width};

										background: ${colorMapperEntry.gradient};

										border-radius: 64px;
									`}
								>
									<button
										type="button"
										title={t("Click me!")}
										onClick={() => updatecolorMapperEntry()}
										className={css`
											padding: 0.35em 0.75em;

											font-size: 1.25em;
											font-weight: 600;
											color: inherit;
											filter: invert(100%);

											/* reset */
											background: transparent;
										`}
									>
										{t(colorMapperEntry.descriptionAccessor)}
									</button>
								</div>
							</div>

							<div
								ref={availabilityGridRef}
								className={css`
									display: flex;
									flex-direction: row;

									margin: auto;
									/* justify-content: space-around; */
									justify-content: center;
									align-items: center;
								`}
							>
								{availability.map((avail) => (
									<article key={avail[0].dayIndex}>
										<h1>{avail[0].dayIndex + 1}</h1>

										<ul
											className={css`
												margin: 0.5em;
											`}
										>
											{avail.map((a) =>
												displayType === "+-=" ? (
													<li
														key={`${a.dayIndex}--${a.timeIndex}`}
														className={css`
											/*
											background: ${mapRatioToHSLThroughHue(
												a.bussyParticipants.length /
													(a.availableParticipants.length + a.bussyParticipants.length)
											)};
											*/

											margin-top: 0.5em;
											margin-bottom: 0.5em;
										`}
													>
														<span
															className={css`
																display: inline-block;
																min-width: 3ch;

																padding: 0.25em;
																color: hsl(240, 100%, 50%);
															`}
														>
															+{a.availableParticipants}
														</span>
														<span
															className={css`
																display: inline-block;
																min-width: 3ch;

																padding: 0.25em;
																color: hsl(0, 100%, 50%);
															`}
														>
															-{a.bussyParticipants}
														</span>
														<span
															className={css`
																display: inline-block;
																min-width: 3ch;

																padding: 0.25em;
																color: grey;
															`}
														>
															=
															{a.availableParticipants.length +
																a.bussyParticipants.length}
														</span>
													</li>
												) : displayType === "mapped ratio to HSL" ? (
													<li
														key={`${a.dayIndex}--${a.timeIndex}`}
														className={cx(
															css`
													/*
													background: ${mapRatioToHSLThroughHue(
														a.bussyParticipants.length /
															(a.availableParticipants.length +
																a.bussyParticipants.length)
													)};
													*/

													/* background: ${mapRatioToHSBThroughBrightness(
														a.bussyParticipants.length /
															(a.availableParticipants.length +
																a.bussyParticipants.length)
													)}; */

													background: ${colorMapperEntry.fn(
														a.bussyParticipants.length /
															(a.availableParticipants.length +
																a.bussyParticipants.length)
													)};


													margin-top: 0.5em;
													margin-bottom: 0.5em;

													border: 2px solid transparent;

													/* padding: 0.5em; */
												`,
															{
																[css`
																	/* border: 1px solid #ffc400; */
																	border: 2px solid hsl(38, 100%, 50%);
																`]:
																	a.dayIndex === selectedDay &&
																	a.timeIndex === selectedTime,
															}
														)}
													>
														<button
															type="button"
															onClick={() =>
																setSelectedAvailability(a.dayIndex, a.timeIndex)
															}
															className={css`
																padding: 1em;

																width: 100%;
																height: 100%;

																font-size: 1.05em;

																font-family: inherit;
																color: inherit;
																background: transparent;
															`}
														>
															<span
																className={css`
																	font-weight: bold;
																	font-size: 1em;

																	color: inherit;
																	filter: invert(100%);

																	/** https://twitter.com/piccalilli_/status/1233358303092232194 */
																	font-feature-settings: "tnum";
																	font-variant-numeric: tabular-nums;
																`}
															>
																{/* {a.availableParticipants}/ */}
																{a.availableParticipants.length}/
																{a.availableParticipants.length +
																	a.bussyParticipants.length}
															</span>
														</button>

														{/* <div
												className={css`
													display: flex;
													flex-direction: column;
												`}
											>
												<span
													className={css`
														display: inline-block;
														min-width: 3ch;

														padding: 0.25em;
														color: inherit;
														filter: invert(100%);
													`}
												>
													{a.availableParticipants}
												</span>

												<Divider
													className={css`
														color: inherit;
														filter: invert(100%);
													`}
												/>

												<span
													className={css`
														display: inline-block;
														min-width: 3ch;

														padding: 0.25em;
														color: inherit;
														filter: invert(100%);
													`}
												>
													{a.availableParticipants + a.bussyParticipants}
												</span>
											</div> */}
													</li>
												) : null
											)}
										</ul>
									</article>
								))}
							</div>
						</div>
					) : !wantedParticipants?.length ? (
						<button
							type="button"
							onClick={(): Promise<void> =>
								axios
									.get(`/api/v1/participant/random`)
									.then((res: { data: { participants: Participant[] } }) =>
										setWantedParticipants(res.data?.participants ?? [])
									)
									.catch((err) => {
										console.error(err);
									})
							}
							className={css`
								font-family: inherit;
								background: inherit;
								color: inherit;

								margin: 0em auto auto 2em;
								padding: 0.5em 2em;

								border-radius: 5px;

								background: ${colorMapperEntrys.filter((e) => e.name === colorMapperName)[0].gradient ??
									colorMapperEntrys[0].gradient};

								color: white;
							`}
						>
							<h2>{t("See an example")}</h2>
						</button>
					) : null}
				</section>
				{/* /availability display */}

				{/* participant selection */}
				<section
					className={css`
						grid-area: select;
					`}
				>
					{/* <div
						className={css`
							grid-area: select;

							display: inline-flex;

							flex-direction: column;
							justify-content: center;
							align-items: center;
						`}
					>
						<div
							className={css`
								width: 100%;
								padding: 0 2em;

								display: flex;
								flex-direction: row;

								justify-content: space-between;
								align-items: center;
							`}
						>
							<h1 className={css``}>
								{t("participants")(
									(wantedParticipants ?? "")
										.split(",")
										.map((wp) => wp.trim())
										.filter((wp) => !!wp).length
								)}
							</h1>

							<button
								type="button"
								onClick={() => {
									setWantedParticipants("");
									setSelectedAvailability(invalidEnDeVal, invalidEnDeVal);
								}}
								className={css`
									font-family: inherit;
									background: inherit;
									color: inherit;

									background: inherit;
									color: inherit;
								`}
							>
								<h1
									className={css`
										text-transform: capitalize;
									`}
								>
									{t("(to) clear")}
								</h1>
							</button>
						</div>

						<textarea
							// type="text"
							rows={12}
							cols={24}
							name="wantedParticipants"
							id="wantedParticipants"
							placeholder={t("Enter the participant names") + ":"}
							value={wantedParticipants}
							// onChange={(e) => handleWantedParticipantsChange(e)}
							onChange={(e) => setWantedParticipants(e.target.value)}
							className={css`
								margin-left: 1em;
								margin-right: 1em;
								padding: 0.5em 0.5em;

								font-size: 1.5em;

								border: 1px solid hsl(240, 37%, 54%);
								border-radius: 5px;
							`}
						/>

						{!wantedParticipants ? null : (
							<p
								className={css`
									max-width: 40ch;

									margin: 2em 2em 0 2em;

									text-align: left;
								`}
							>
								{t("The UI/UX will be improved by the time the Beta phase is over")}.
							</p>
						)}
					</div> */}

					<div
						className={css`
							margin-left: ${hasSelectedExtraInfo ? "0em" : "1em"};
							margin-bottom: 2em;
						`}
					>
						<ParticipantPicker
							participants={participants}
							hasSelectedExtraInfo={hasSelectedExtraInfo} //
							// handleChange={handleWantedParticipantChange}
							wantedParticipants={wantedParticipants}
							setWantedParticipants={setWantedParticipants}
						/>
					</div>
				</section>
				{/* /participant selection */}

				{/* detailed availability info */}
				<section
					className={css`
						grid-area: detailed-info;

						${!hasSelectedExtraInfo ? "display: none;" : ""}
					`}
				>
					<h1
						className={css`
							& > * + * {
								margin-left: 1em;
							}
						`}
					>
						<span>{t("Extra info")}</span>

						<button
							type="button"
							onClick={unselectAvailability}
							className={css`
								font-size: larger;
								font-weight: bold;
							`}
						>
							&times;
						</button>
					</h1>

					{!selectedAvailability ? (
						<p>{t("Select a time interval")}</p>
					) : (
						<>
							<article>
								<h1>
									{t("day")}: {selectedAvailability.dayIndex + 1}
								</h1>
							</article>

							<article>
								<h1>
									{t("time")}: {selectedAvailability.timeIndex + 1}
								</h1>
							</article>

							<article>
								<h1>
									{t("available (adj, mult)")} ({selectedAvailability.availableParticipants.length}):
								</h1>
								<ul>
									{selectedAvailability.availableParticipants.map((p) => (
										<ParticipantListItem
											key={p.participant}
											participant={p.participant}
											dayIndex={selectedAvailability.dayIndex}
											timeIndex={selectedAvailability.timeIndex}
										/>
									))}
								</ul>
							</article>

							<article>
								<h1>
									{t("bussy (adj, mult)")} ({selectedAvailability.bussyParticipants.length}):
								</h1>
								<ul>
									{selectedAvailability.bussyParticipants.map((p) => (
										<ParticipantListItem
											key={`${p.participant}/${p.lesson.id}`}
											participant={p.participant}
											dayIndex={selectedAvailability.dayIndex}
											timeIndex={selectedAvailability.timeIndex}
										>
											{" "}
											({p.lesson.name})
										</ParticipantListItem>
									))}
								</ul>
							</article>

							<article>
								<h1>
									{t("total")}:{" "}
									{selectedAvailability.availableParticipants.length +
										selectedAvailability.bussyParticipants.length}
								</h1>
							</article>
						</>
					)}
				</section>
				{/* /detailed availability info */}
			</main>

			<div
				className={css`
					${notDesktop} {
						min-height: 20vh;
					}
				`}
			/>
		</>
	);
};
