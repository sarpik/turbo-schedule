/* eslint-disable indent */

import React, { FC, useState, useEffect, useRef } from "react";
import axios from "axios";
import { css } from "emotion";

import { Availability as IAvailability } from "@turbo-schedule/common";

// import { Divider } from "components/studentSchedule/Divider";
import { useQueryFor } from "../../hooks/useQueryFor";
import { Navbar } from "../../components/navbar/Navbar";
import { useTranslation } from "../../i18n/useTranslation";

const mapRatioToHSL = (ratio: number, hueStart: number = 240, hueEnd: number = 360): string => {
	const hue: number = hueStart + (hueEnd - hueStart) * ratio;

	const saturation: number = 100;
	const lightness: number = 60;

	return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

export const Availability: FC = () => {
	const t = useTranslation();

	// const history = useHistory();
	const [wantedParticipants, setWantedParticipants] = useQueryFor(
		"p",
		// ""
		// "Melnikovas Kipras IVe, Mėčius Gediminas IVe, Adomaitis Jurgis IIIc, "
		"Melnikovas Kipras IVe, Baltūsienė Violeta, Mėčius Gediminas IVe, Zaboras Edgaras IVGc, Adomaitis Jurgis IIIc, Rimkus Gabrielius IIIc, IIGd, IIGb, IGb, IIGa, IGa"
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

	return (
		<>
			<Navbar />

			<h1>{t("Common Availability")}</h1>

			<p
				className={css`
					margin-left: 1em;
					margin-right: 1em;
				`}
			>
				Dažnai būna situacijų, kai turitę žmonių grupę ir norite rasti bendrą laiką susitikimui.{" "}
				<i
					className={css`
						white-space: nowrap;
					`}
				>
					{t("Common Availability")}
				</i>{" "}
				būtent tam ir skirtas!
			</p>

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

								background: linear-gradient(to right, hsl(360, 100%, 50%), hsl(240, 100%, 50%));

								border-radius: 64px;
							`}
						>
							<p
								className={css`
									padding: 0.35em 0.75em;

									font-size: 1.5em;
									font-weight: 600;
									filter: invert(100%);
								`}
							>
								raudona - užimta; mėlyna - laisva
							</p>
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
											background: ${mapRatioToHSL(a.bussyParticipants / (a.availableParticipants + a.bussyParticipants))};
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
													background: ${mapRatioToHSL(
														a.bussyParticipants /
															(a.availableParticipants + a.bussyParticipants)
													)};

													margin-top: 0.5em;
													margin-bottom: 0.5em;

													padding: 0.5em;
												`}
											>
												<div
													className={css`
														padding: 0.5em;
													`}
												>
													<span
														className={css`
															font-weight: bold;

															color: inherit;
															filter: invert(100%);
														`}
													>
														{a.availableParticipants}/
														{a.availableParticipants + a.bussyParticipants}
													</span>
												</div>

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
			) : null}

			<textarea
				// type="text"
				rows={8}
				cols={28}
				name="wantedParticipants"
				id="wantedParticipants"
				value={wantedParticipants}
				// onChange={(e) => handleWantedParticipantsChange(e)}
				onChange={(e) => setWantedParticipants(e.target.value)}
				className={css`
					margin-top: 4em;
					margin-left: 1em;
					margin-right: 1em;
					padding: 0.5em 0.5em;

					font-size: 1.5em;

					border: 1px solid hsl(240, 37%, 54%);
					border-radius: 5px;
				`}
			/>

			<div
				className={css`
					min-height: 20vh;
				`}
			/>
		</>
	);
};
