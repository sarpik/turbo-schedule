import { useState, useEffect } from "react";

export const useWindow = () => {
	const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

	useEffect(() => {
		setWindowWidth(window.innerWidth);
	}, [setWindowWidth, window.innerWidth]);

	const isDesktop: boolean = windowWidth > 1024;

	return { windowWidth, isDesktop };
};
