import { ParticipantLabel, WantedParticipant } from "../model/Participant";

export const isClass = (t: string): boolean =>
	/^\d\w/ /* 5a, 5b, 8a, 8b */
		.test(t) ||
	/^I+V?G?\w$/ /* IGa, IGb, Ia, IIGa, IIIGa, IVGa */
		.test(t);

export const isRoom = (t: string): boolean =>
	/^\w\d+/ /* A201 Maths, K113 Physics */
		.test(t) ||
	/^\(\d:\d\)/ /* (10:45) A201 Maths (somehow they manage to sometimes add the time *facepalm*) */
		.test(t) ||
	/^\w \w+/ /* A Maths, K Technology */
		.test(t) ||
	/^\w+ \d/ /* Workshop 1, Workshop 2 */
		.test(t);

/**
 * match non-latin characters aswell
 * with the /\p{L}/u thingie.
 *
 * see https://stackoverflow.com/a/48902765/9285308
 *
 */
export const isTeacher = (t: string): boolean =>
	/\p{L}{2,} \p{L}{2,}( \p{L}{2,})?$/u.test(t) && !isClass(t.split(" ").reverse()[0]);

export const isStudent = (t: string): boolean => {
	const split = t.split(" ");
	const last = [...split].reverse()[0];
	const exceptLast = [...split].slice(0, -1).join(" ");

	if (isTeacher(exceptLast) && isClass(last)) {
		return true;
	}

	return false;
};

/**
 * thought about using this in the frontend but realised
 * this is specific to our only schools' scraper so that's no go.
 *
 * after more thought, our participants' "text" is specific too,
 * and we should use our own format
 * (or if we'll have more schools in the future - remap them to this one,
 * but I don't think this format is the best, so we might as well use our standard one).
 *
 * Thus, until then, we can probably use this in the frontend aswell.
 * Note that this *will* cause an issue when adding more schools
 * since we'll likely forget it
 *
 * TODO FIXME HACK
 */
export async function participantClassifier(
	text: string,
	useServiceIfError: boolean = true
): Promise<ParticipantLabel> {
	const classifiers: [(t: string) => boolean, ParticipantLabel][] = [
		[isClass, "class"],
		[isRoom, "room"],
		[isTeacher, "teacher"],
		[isStudent, "student"],
	];

	const matchedLabels: ParticipantLabel[] = classifiers
		.filter(([isMatch]) => isMatch(text))
		.map(([_, labels]) => labels);

	if (matchedLabels.length === 1) {
		return matchedLabels[0];
	} else if (useServiceIfError) {
		return fetch(`/api/v1/participant/classify?participants=${text}`)
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				return res;
			})
			.then((res: { participants: WantedParticipant[] }) => res.participants[0].labels[0]);
	} else if (matchedLabels.length === 0) {
		throw new Error(`Participant classification failed (0) - no matcher matched. Participant text: \`${text}\``);
	} else {
		throw new Error(
			`Participant classification failed (2+) - more than one matched. Participant text: \`${text}\`, matched labels: ${matchedLabels.join(
				", "
			)}`
		);
	}
}
