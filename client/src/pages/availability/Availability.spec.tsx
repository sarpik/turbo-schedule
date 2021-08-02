import React from "react";
import { createBrowserHistory } from "history";

import { delay } from "@turbo-schedule/common";

import {
	setupServerFull, //
	rest,
	screen,
	/* fireEvent, */
	waitFor,
	renderWrap,
} from "../../test-utils";
import { Availability } from "./Availability";

setupServerFull(
	rest.get("/api/v1/participant", (_req, res, ctx) =>
		res(
			ctx.status(200),
			ctx.json({
				participants: [
					{
						id: "5a",
						text: "5a",
						originalHref: "",
						labels: ["class", "student"],
						originalScheduleURI: "",
						fullClassOrig: "5a",
						classNumOrig: "5",
						classCharOrig: "a",
						fullClass: "5a",
						classNum: 5,
						classChar: "a",
					},
					{
						id: "5b",
						text: "5b",
						originalHref: "",
						labels: ["class", "student"],
						originalScheduleURI: "",
						fullClassOrig: "5b",
						classNumOrig: "5",
						classCharOrig: "b",
						fullClass: "5b",
						classNum: 5,
						classChar: "b",
					},
					{
						id: "6d",
						text: "6d",
						originalHref: "x30016d354.htm",
						labels: ["class", "student"],
						originalScheduleURI: "",
						fullClassOrig: "6d",
						classNumOrig: "6",
						classCharOrig: "d",
						fullClass: "6d",
						classNum: 6,
						classChar: "d",
					},
				],
			} as const)
		)
	),
	rest.get("/api/v1/participant/common-availability", (_req, res, ctx) =>
		/** TODO CommonAvailRes type */
		res(
			ctx.status(200),
			ctx.json({
				minDayIndex: 0,
				maxDayIndex: 1,
				minTimeIndex: 0,
				maxTimeIndex: 1,
				availability: [
					[
						{
							dayIndex: 0,
							timeIndex: 0,
							availableParticipants: [],
							bussyParticipants: [
								{ participant: "5a", lesson: { id: "69", name: "maths" } }, //
								{ participant: "5b", lesson: { id: "420", name: "literature" } },
								{ participant: "6d", lesson: { id: "1337", name: "physics" } },
							],
						},
						{
							dayIndex: 0,
							timeIndex: 1,
							availableParticipants: [
								{ participant: "5a", lesson: { id: "0" } }, //
								{ participant: "5b", lesson: { id: "0" } },
							],
							bussyParticipants: [
								{ participant: "6d", lesson: { id: "21", name: "dance" } }, //
							],
						},
					],
				],
			} as const)
		)
	)
);

describe("Availability on-load logic", () => {
	it("should **not** clear the selected day and time (and thus - extra info selection) if >0 participants were selected", async (done) => {
		const history = createBrowserHistory();

		history.push(`/avail?p=5a,5b,6d&day=0&time=1`);

		renderWrap(<Availability />, { history });

		await waitFor(() => {
			const params: URLSearchParams = new URLSearchParams(history.location.search);

			expect(params.get("day")).not.toBeNull();
			expect(params.get("day")).toBe("0");

			expect(params.get("time")).not.toBeNull();
			expect(params.get("time")).toBe("1");
		});

		/**
		 * uh oh
		 * startTransition n stuff
		 */
		await delay(1000);

		await waitFor(() => {
			expect(screen.queryByText("Extra info")).not.toBeNull();

			// +1
			expect(screen.queryByText(/day: 1/g)).not.toBeNull();
			expect(screen.queryByText(/time: 2/g)).not.toBeNull();

			expect(screen.queryByText(/available \(2\)/)).not.toBeNull();
			expect(screen.queryByText(/bussy \(1\)/)).not.toBeNull();
		});

		done();
	});

	it("should **do** clear the selected day and time (and thus - extra info selection) if <=0 participants were selected", async (done) => {
		const history = createBrowserHistory();

		/**
		 * ! main difference here - no "classes" (or other participants) selected in the URL.
		 * ! `day` and `time` should get removed by the component
		 */
		history.push(`/avail?day=0&time=1`);

		renderWrap(<Availability />, { history });

		/**
		 * initial passes n stuff
		 */
		await delay(1000);

		await waitFor(() => {
			const params: URLSearchParams = new URLSearchParams(history.location.search);

			expect(params.get("day")).toBeNull();

			expect(params.get("time")).toBeNull();
		});

		/**
		 * uh oh
		 * startTransition n stuff
		 */
		await delay(1000);

		await waitFor(() => {
			expect(screen.queryByText("See an example")).not.toBeNull();
			// expect(screen.queryByText("Extra info")).toBeNull();

			// +1
			expect(screen.queryByText(/day: 1/g)).toBeNull();
			expect(screen.queryByText(/time: 2/g)).toBeNull();

			expect(screen.queryByText(/available \(2\)/)).toBeNull();
			expect(screen.queryByText(/bussy \(1\)/)).toBeNull();
		});

		done();
	});
});
