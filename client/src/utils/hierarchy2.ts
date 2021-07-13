#!/usr/bin/env ts-node-dev

import fs from "fs";

import { Participant, Class, Student, Teacher, Room } from "@turbo-schedule/common";

import { Dictionary } from "../i18n/i18n";

const { participants } = JSON.parse(fs.readFileSync("res2.json", { encoding: "utf-8" }));
console.log("participants.length", participants.length);

/**
 * TODO: binary search to find indices & use `.slice`
 */

const hierarchy = (isDifferent) => (upperGroup) => {
	// const groups = [];
	let group = [];

	let groupIdx = 0;

	for (let i = 0; i < upperGroup.length - 1; i++) {
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

	// group.push(upperGroup[upperGroup.length - 1]);
	// groups.push(group);
};

type NeverIfEmpty<T> = {} extends any ? ([] extends T ? never : T) : never;

type A = NeverIfEmpty<[1, 2]>;
type B = NeverIfEmpty<[]>;

// interface Diff<P, Q, C extends (readonly Diff<any, any, any[]>[])> {
type Diff<
	P, //
	Q,
	C extends Diff<any, any, any[]>[] = []
	// D = [] extends C ? never : C
> = {
	// // getGroupName(firstGroupEntry: P): keyof Dictionary;
	// getGroupName(): keyof Dictionary;
	// getGroupName(firstGroupEntry: P): string;
	getGroupName(firstGroupEntry: P): keyof Dictionary | string;
	isDifferent(p: P, q: Q): boolean;
	children: C;
};

const diffs: Diff<
	Participant,
	Participant,
	[
		Diff<Class, Student, [Diff<Class, Class>]>, //
		Diff<Student, Teacher, [Diff<Student, Student, [Diff<Student, Student>]>]>,
		Diff<Teacher, Room>,
		Diff<Room, Room>
	]
> = {
	getGroupName: (): keyof Dictionary => "Everyone",
	isDifferent: () => false,
	children: [
		{
			getGroupName: (): keyof Dictionary => "Classes",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
			children: [
				{
					getGroupName: (p0: Class) => p0.classNum.toString(),
					isDifferent: (p, q) => p.classNum !== q.classNum,
					children: [], // TODO - no need
				},
			],
		},
		{
			getGroupName: () => "Students",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
			children: [
				{
					getGroupName: (student) => student.classNum.toString(),
					isDifferent: (s1, s2) => s1.classNum !== s2.classNum,
					children: [
						{
							getGroupName: (student) => student.classChar,
							isDifferent: (s1, s2) => s1.classChar !== s2.classChar,
							children: [],
						},
					],
				},
			],
		},
		{
			getGroupName: () => "Teachers",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
			children: [],
		},
		{
			getGroupName: () => "Rooms",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
			children: [],
		},
	],
};

console.log("diffs", diffs);

const differenciators = [
	// () => "Everyone",
	// [
	// 	() => false,
	// 	[
	[
		[() => "Classes", (p, q) => p.labels[0] !== q.labels[0]], // class <-> student
		[(p0) => p0.classNum, (p, q) => p.classNum !== q.classNum], // 8{a,b,c,d,e,...}, 9{a,b,c,d,e,...}, etc. (group by classNum)
		/**
		 * no need for classChar since all classes have,
		 * by definition, different chars to separate them
		 */
	],
	[
		[() => "Students", (p, q) => p.labels[0] !== q.labels[0]], // student <-> teacher
		[(p0) => p0.classNum, (p, q) => p.classNum !== q.classNum], // 8{a,b,c,d,e,...}, 9{a,b,c,d,e,...}, etc. (group by classNum)
		[(p0) => p0.classChar, (p, q) => p.classChar !== q.classChar], // a, b, c, d, e, ...
	],
	[
		[() => "Teachers", (p, q) => p.labels[0] !== q.labels[0]], // teacher <-> room
	],

	/** last one should always be the same */
	[
		[() => "Rooms", (_p, _q) => false], // room <-> <null>
	],
	// ],
	// 	],
];

// hierarchy(differenciators)(participants).map(hierarchy());

for (const isDifferentGroup of differenciators) {
	const groupIdx = 0;
	const getGroupName = isDifferentGroup[groupIdx][0];
	const isDifferent = isDifferentGroup[groupIdx][1];
	hierarchy(isDifferent);
}

export {};
