import React, { FC } from "react";
import { css } from "emotion";

import { Divider } from "../components/studentSchedule/Divider";

interface Props {
	top: string | number;
	bottom: string | number;
}
export const Fraction: FC<Props> = ({ top, bottom }) => (
	<>
		<p
			className={css`
				margin: 0;
			`}
		>
			{top}
		</p>
		<Divider height="1px" />
		<p
			className={css`
				margin: 0;
			`}
		>
			{bottom}
		</p>
	</>
);
