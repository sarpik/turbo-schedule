#!/usr/bin/env ts-node-dev

const fs = require("fs");

const { participants } = JSON.parse(fs.readFileSync("res2.json", { encoding: "utf-8" }));
console.log("participants.length", participants.length);

/**
 * TODO: binary search to find indices & use `.slice`
 */

const hierarchy = (isDifferent) => (upperGroup) => {
	// const groups = [];
	let group = [];

	let groupIdx = 0;

	for (let i = 0; i < upperGroup.length; i++) {
		const curr = upperGroup[i];
		const next = upperGroup[i + 1];
		const areDifferent = isDifferent[groupIdx];

		group.push(curr);

		if (areDifferent(curr, next)) {
			// console.log("curr", curr, "next", next);

			// groups.push(group);
			group = [];
			groupIdx++;
		}
	}

	// groups.push(group);
};

// const differenciators = [
// 	// () => "Everyone",
// 	// [
// 	// 	() => false,
// 	// 	[
// 	[
// 		[() => "Classes", (p, q) => p.labels[0] !== q.labels[0]], // class <-> student
// 		[(p0) => p0.classNum, (p, q) => p.classNum !== q.classNum], // 8{a,b,c,d,e,...}, 9{a,b,c,d,e,...}, etc. (group by classNum)
// 		/**
// 		 * no need for classChar since all classes have,
// 		 * by definition, different chars to separate them
// 		 */
// 	],
// 	[
// 		[() => "Students", (p, q) => p.labels[0] !== q.labels[0]], // student <-> teacher
// 		[(p0) => p0.classNum, (p, q) => p.classNum !== q.classNum], // 8{a,b,c,d,e,...}, 9{a,b,c,d,e,...}, etc. (group by classNum)
// 		[(p0) => p0.classChar, (p, q) => p.classChar !== q.classChar], // a, b, c, d, e, ...
// 	],
// 	[
// 		[() => "Teachers", (p, q) => p.labels[0] !== q.labels[0]], // teacher <-> room
// 	],

// 	/** last one should always be the same */
// 	[
// 		[() => "Rooms", (_p, _q) => false], // room <-> <null>
// 	],
// 	// ],
// 	// 	],
// ];

// hierarchy(differenciators)(participants).map(hierarchy());

for (const isDifferentGroup of differenciators) {
	const groupIdx = 0;
	const getGroupName = isDifferentGroup[groupIdx][0];
	const isDifferent = isDifferentGroup[groupIdx][1];
	hierarchy(isDifferent);
}
