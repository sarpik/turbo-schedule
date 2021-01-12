/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React, { FC, useContext } from "react";
import { css } from "emotion";

import { CurrentLangContext } from "../currentLangContext/currentLangContext";
import { ILang } from "../../i18n/i18n";

interface Props {
	//
}

/** TODO `react-select` @ https://react-select.com */
export const LangSelect: FC<Props> = () => {
	const { currentLang, setLang, availableLangs } = useContext(CurrentLangContext);

	return (
		<select
			name="lang"
			// // value={currentLang}
			defaultValue={currentLang.toUpperCase()}
			onChange={(e) => setLang(e.target.value.toLowerCase() as ILang)}
			className={css`
				vertical-align: bottom;
				font-size: 1em;

				/** https://stackoverflow.com/a/34532555/9285308 */
				text-align: center; /** firefox & others */
				-moz-text-align-last: center;

				text-align-last: center; /** chrome */
			`}
		>
			{availableLangs
				.map((lang) => lang.toUpperCase())
				.map((lang) => (
					<option key={lang} value={lang}>
						{lang}
					</option>
				))}
		</select>
	);
};
