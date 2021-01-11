/* eslint-disable indent */

import React, { FC, useState, useEffect, useRef, useReducer } from "react";
import axios from "axios";
import { cx, css } from "emotion";

import { Availability as IAvailability } from "@turbo-schedule/common";

import { Dictionary } from "../../i18n/i18n";
import { useWindow } from "../../hooks/useWindow";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useQueryFor } from "../../hooks/useQueryFor";
import { Navbar } from "../../components/navbar/Navbar";
import { useTranslation } from "../../i18n/useTranslation";

const mapRatioToHSLThroughHue = (ratio: number, hueStart: number = 240, hueEnd: number = 360): string => {
	const hue: number = hueStart + (hueEnd - hueStart) * ratio;

	const saturation: number = 100;
	const lightness: number = 60;

	return `hsl(${hue} ${saturation}% ${lightness}%)`;
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

	// const history = useHistory();
	const [wantedParticipants, setWantedParticipants] = useQueryFor(
		"p",
		// "Melnikovas Kipras IVe, Mėčius Gediminas IVe, Adomaitis Jurgis IIIc, "
		// "Melnikovas Kipras IVe, Baltūsienė Violeta, Mėčius Gediminas IVe, Zaboras Edgaras IVGc, Adomaitis Jurgis IIIc, Rimkus Gabrielius IIIc, IIGd, IIGb, IGb, IIGa, IGa"
		""
	);

	type TDisplayType = "+-=" | "available / total" | "bussy / total" | "mapped ratio to HSL";

	const [displayType] = useState<TDisplayType>("mapped ratio to HSL");

	// const handleWantedParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
	// 	setWantedParticipants(e.target.value);

	// 	const params = new URLSearchParams();
	// 	params.append("p", e.target.value);

	// 	console.log("params upd", params.toString());

	// 	history.push({ search: params.toString() });
	// };

	const [availability, setAvailability] = useState<IAvailability[][]>([]);

	useEffect(() => {
		axios
			.get<{ availability: IAvailability[][] }>(
				`/api/v1/participant/common-availability?wanted-participants=${wantedParticipants
					.split(",")
					.map((wp) => wp.trim())
					.filter((wp) => !!wp)
					.join(",")}`
			)
			.then((res) => {
				console.log("res", res);
				setAvailability(res?.data?.availability ?? []);
			})
			.catch((e) => console.error(e));
	}, [wantedParticipants]);

	const availabilityGridRef = useRef<HTMLDivElement>(null);

	console.log("availabilityGridRef", availabilityGridRef);

	console.log(availability);

	/** begin bussy/available button indication */
	interface IColorMapperEntry {
		name: string;
		descriptionAccessor: keyof Dictionary;
		gradient: string;
		fn: (ratio: number, rangeStart?: number, rangeEnd?: number) => string;
	}

	const colorMapperEntrys: IColorMapperEntry[] = [
		{
			name: "red-blue",
			descriptionAccessor: "red - bussy; blue - available",
			gradient: "linear-gradient(to right, hsl(360, 100%, 50%), hsl(240, 100%, 50%))",
			fn: mapRatioToHSLThroughHue,
		},
		{
			name: "black-white",
			descriptionAccessor: "white - bussy; black - available",
			gradient: "linear-gradient(to right, hsl(0, 0%, 90%), hsl(0, 0%, 10%))",
			fn: mapRatioToHSBThroughBrightness,
		},
	];

	const [colorMapperName, setColorMapperName] = useLocalStorage("colorMapperName", colorMapperEntrys[0].name);

	// const [colorMapperEntry, setcolorMapperEntry] = useReducer<IColorMapperEntry[], IColorMapperEntry["name"]>(
	const [colorMapperEntry, updatecolorMapperEntry] = useReducer((prevState) => {
		if (prevState.name === "red-blue") {
			setColorMapperName(colorMapperEntrys[1].name);
			return colorMapperEntrys[1];
		} else if (prevState.name === "black-white") {
			setColorMapperName(colorMapperEntrys[0].name);
			return colorMapperEntrys[0];
		}

		setColorMapperName(colorMapperEntrys[0].name);
		return colorMapperEntrys[0];
	}, colorMapperEntrys.filter((e) => e.name === colorMapperName)?.[0] ?? colorMapperEntrys[0]);
	/** end bussy/available button indication */

	const { isDesktop } = useWindow();

	const [selectedAvailability, setSelectedAvailability] = useState<IAvailability | null>(null);

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
					`,

					{
						[css`
							grid-template-areas:
								"info info info"
								"select display detailed-info"
								"select display detailed-info";
						`]: isDesktop,
					},
					{
						[css`
							grid-template-areas:
								"info info info"
								"select select select"
								"display display display"
								"detailed-info detailed-info detailed-info";

							& > * + * {
								margin-top: 2em;
							}
						`]: !isDesktop,
					}
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
											background: ${mapRatioToHSLThroughHue(a.bussyParticipants / (a.availableParticipants + a.bussyParticipants))};
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
															={a.availableParticipants + a.bussyParticipants}
														</span>
													</li>
												) : displayType === "mapped ratio to HSL" ? (
													<li
														key={`${a.dayIndex}--${a.timeIndex}`}
														className={css`
													/*
													background: ${mapRatioToHSLThroughHue(a.bussyParticipants / (a.availableParticipants + a.bussyParticipants))};
													*/

													/* background: ${mapRatioToHSBThroughBrightness(
														a.bussyParticipants /
															(a.availableParticipants + a.bussyParticipants)
													)}; */

													background: ${colorMapperEntry.fn(a.bussyParticipants / (a.availableParticipants + a.bussyParticipants))};


													margin-top: 0.5em;
													margin-bottom: 0.5em;

													/* padding: 0.5em; */
												`}
													>
														<button
															type="button"
															onClick={() => setSelectedAvailability(a)}
															className={css`
																padding: 1em;

																width: 100%;
																height: 100%;

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
																`}
															>
																{a.availableParticipants}/
																{a.availableParticipants + a.bussyParticipants}
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
					) : !wantedParticipants ? (
						<button
							type="button"
							onClick={() =>
								setWantedParticipants(
									"Melnikovas Kipras IVe, Baltūsienė Violeta, Mėčius Gediminas IVe, Zaboras Edgaras IVGc, Adomaitis Jurgis IIIc, Rimkus Gabrielius IIIc, IIGd, IIGb, IGb, IIGa, IGa"
								)
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
							<h2>Pamatyti pavyzdį</h2>
						</button>
					) : null}
				</section>
				{/* /availability display */}

				{/* participant selection */}
				<section className={css``}>
					<div
						className={css`
							grid-area: select;

							display: inline-flex;

							flex-direction: column;
							justify-content: center;
							align-items: center;
						`}
					>
						<h1 className={css``}>
							{t("participants")(
								wantedParticipants
									.split(",")
									.map((wp) => wp.trim())
									.filter((wp) => !!wp).length
							)}
						</h1>

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
						<p
							className={css`
								max-width: 40ch;

								margin: 2em 2em 0 2em;

								text-align: left;
							`}
						>
							Dėmesio! Neteisingai suvedus mokinio / mokytojo / klasės / kabineto pavadinimą, jis prisidės
							prie bendro dalyvių kiekio, bet nebus atsižvelgta į laikus, kai jis užimtas (kitaip tariant
							- jis visada bus laisvas). Kai išeisime iš Beta versijos &ndash; šios problemos nebeliks.
						</p>
					</div>
				</section>
				{/* /participant selection */}

				{/* detailed availability info */}
				<section
					className={css`
						grid-area: detailed-info;
						//
					`}
				>
					<h1>extra info (coming soon!)</h1>

					{selectedAvailability ? (
						<>
							<p>this will display the participants' names (by availability)</p>

							<p>day {selectedAvailability.dayIndex + 1}</p>
							<p>time {selectedAvailability.timeIndex + 1}</p>
							<p>avail {selectedAvailability.availableParticipants}</p>
							<p>bussy {selectedAvailability.bussyParticipants}</p>
							<p>
								total{" "}
								{selectedAvailability.availableParticipants + selectedAvailability.bussyParticipants}
							</p>
						</>
					) : null}
				</section>
				{/* /detailed availability info */}
			</main>

			{!isDesktop ? (
				<div
					className={css`
						min-height: 20vh;
					`}
				/>
			) : null}
		</>
	);
};
