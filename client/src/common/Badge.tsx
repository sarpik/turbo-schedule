import React, { FC } from "react";
import { cx, css } from "emotion";

interface Props {
	text: string;
	gapWidth?: number;
}

export const Badge: FC<Props & React.HTMLProps<HTMLDivElement>> = ({ text, gapWidth = 0, ...rest }) => (
	<div
		{...rest}
		className={cx(
			css`
				position: absolute;

				top: -16px;
				right: ${-38 + gapWidth}px;

				transform: rotateZ(25deg);

				padding: 4px;
				border-radius: 4px;

				/* box-shadow: 0 0 transparent 0 0 transparent; */
				/* box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); */
				/* box-shadow: -5px 15px 20px -5px rgba(0, 0, 0, 0.1),
										0 10px 10px -5px rgba(0, 0, 0, 0.04); */

				box-shadow: -2px 18px 18px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

				font-size: 0.75em;
				font-weight: 600;
				background-color: hsl(240, 100%, 95%);
				color: hsl(240, 37%, 54%) !important;
			`,
			rest.className
		)}
	>
		{text}
	</div>
);
