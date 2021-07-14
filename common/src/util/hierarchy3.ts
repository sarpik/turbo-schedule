/* @ts-nocheck */

/* eslint-disable prettier/prettier */

import fs from "fs";

import { Participant, Class, Student, Teacher, Room } from "@turbo-schedule/common";

// import { Dictionary } from "../../../client/src/i18n/i18n";
type Dictionary = Record<string, string>; // TODO FIXME

const { participants } = JSON.parse(fs.readFileSync("res2.json", { encoding: "utf-8" }));
// const participants = require("./res2.json");
// const participants: Participant[] = []; // TODO FIXME
console.log("participants.length", participants.length);

// type NeverIfEmpty<T> = {} extends any ? ([] extends T ? never : T) : never;

// type _A = NeverIfEmpty<[1, 2]>;
// type _B = NeverIfEmpty<[]>;

// // interface Diff<P, Q, C extends (readonly Diff<any, any, any[]>[])> {
// type _Diff<
// 	P, //
// 	Q,
// 	C extends _Diff<any, any, any[]>[] = []
// 	// D = [] extends C ? never : C
// > = {
// 	// // getGroupName(firstGroupEntry: P): keyof Dictionary;
// 	// getGroupName(): keyof Dictionary;
// 	// getGroupName(firstGroupEntry: P): string;
// 	getGroupName(firstGroupEntry: P): keyof Dictionary | string;
// 	isDifferent(p: P, q: Q): boolean;
// 	children: C;
// };

// type Diff<
// 	P, //
// 	Q,
// 	C extends Diff<any, any, any[]>[] = []
// 	// D = [] extends C ? never : C
// > = [] extends C ? Exclude<_Diff<P, Q, C>, "children"> : _Diff<P, Q, C>;
// //  {
// // 	// // getGroupName(firstGroupEntry: P): keyof Dictionary;
// // 	// getGroupName(): keyof Dictionary;
// // 	// getGroupName(firstGroupEntry: P): string;
// // 	getGroupName(firstGroupEntry: P): keyof Dictionary | string;
// // 	isDifferent(p: P, q: Q): boolean;
// // 	children: C;
// // };

// type Diff<
// 	P, //
// 	Q,
// 	C extends Diff<any, any, any[]>[] = [] // TODO: Remove Array and make `Diff` an array be default
// 	// D = [] extends C ? never : C
// // > = [] extends C
// > = [] extends C
// 	? {
// 			// // getGroupName(firstGroupEntry: P): keyof Dictionary;
// 			// getGroupName(): keyof Dictionary;
// 			// getGroupName(firstGroupEntry: P): string;
// 			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
// 			isDifferent(p: P, q: Q): boolean;
// 			// children: C; // TODO REMOVE
// 	  }
// 	:  {
// 			// // getGroupName(firstGroupEntry: P): keyof Dictionary;
// 			// getGroupName(): keyof Dictionary;
// 			// getGroupName(firstGroupEntry: P): string;
// 			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
// 			isDifferent(p: P, q: Q): boolean;
// 			children: C;
// 	  };

type Diff<
	P, //
	Q,
	C extends Diff<any, any, any[]>[] = Diff<any, any, any[]>[] // TODO: Remove Array and make `Diff` an array be default (((OR NOT)))
	// D = [] extends C ? never : C
// > = [] extends C
> = {
			// // getGroupName(firstGroupEntry: P): keyof Dictionary;
			// getGroupName(firstGroupEntry: P): string;
			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
			isDifferent(p: P, q: Q): boolean;
			children?: C;
	  };

export type ParticipantDiffHierarchy = Diff<
	Participant,
	Participant,
	[
		Diff<Class, Student, [Diff<Class, Class>]>, //
		Diff<Student, Teacher, [Diff<Student, Student, [Diff<Student, Student>]>]>,
		Diff<Teacher, Room>,
		Diff<Room, Room>
	]
>;

export type Hierarchy<T, C extends Hierarchy<T>[] = []> = [] extends C
	? {
			groupName: string;
			currentItems: T[];
	  }
	: {
			groupName: string;
			currentItems: T[];
			children: C;
	  };

// export type ParseHierarchyFromDiff<D extends Diff<any, any, any[]>> = D extends Diff<infer P, infer _Q, infer C>
// 	? C extends []
// 		? C extends [infer Cfirst, ...infer Crest] // eslint-disable-line prettier/prettier
// 			? Cfirst extends Diff<P, _Q, C>
// 				? Crest extends Diff<P, _Q, C>[]
// 					? Cfirst extends Diff<infer PP, any, any[]>
// 						? PP extends P
// 							? Hierarchy<P, [Hierarchy<PP>]>
// 							: 7
// 						: 6
// 					: 5
// 				: 4
// 			: 3
// 		: 2
// 	: 1;

/**
 * good fucking luck understanding this in a bit
 *
 * https://stackoverflow.com/a/65673776/9285308
 *
 * https://stackoverflow.com/a/53356755/9285308
 *   https://github.com/microsoft/TypeScript/pull/39094
 *
 * https://github.com/microsoft/TypeScript/pull/41544
 *
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types
 *
 * https://github.com/typescript-cheatsheets/utilities
 *   https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
 *
 */
export type ParseHierarchyFromDiff<
	DS extends (Diff<any, any, any[]>)[] //
> =
// DS extends undefined ? DS :
	[] extends DS  // recursion exit condition - empty array
		? DS
		: DS extends Diff<any, any, Diff<any, any, any[]>[]>[]
		/**
		 * why we need the `(readonly [infer A, ...infer Rest] | readonly [(infer A)?, ...infer Rest])`:
		 *
		 * (the `A` / `DiffFirst` might not be available if the array is empty)
		 *
		 * https://github.com/microsoft/TypeScript/pull/39094#issuecomment-661622214
 		 *   https://github.com/microsoft/TypeScript/pull/39281
		*/
		? DS extends (readonly [infer DiffFirst, ...infer DiffRest] | readonly [(infer DiffFirst)?, ...infer DiffRest])
			? DiffFirst extends Diff<any, any, any[]> // auxilary verification
				? DiffFirst extends Diff<infer PP, any, infer DSS>
					? DiffRest extends Diff<any, any, any[]>[] // auxilary verification
	  					// ? DiffRest extends undefined ? DiffRest :
						? [] extends DiffRest // recursion exit condition - empty array
					  		/**
					   		* `DiffRest` is empty, meaning
					   		*  we have only one child left in the current hierarchy path
					   		*/
						? [
								Hierarchy<PP, ParseHierarchyFromDiff<DSS>>
						  ]
						  	:
						  [
								Hierarchy<PP, ParseHierarchyFromDiff<DSS>>,
								...ParseHierarchyFromDiff<DiffRest>
						  ]
		// 				 : [5]
		// 			: [4]
		// 		: [3]
		// 	: [2]
		// : [1];
						: never

					: never
				: never
			:  never
		: never;

type UhOh = ParseHierarchyFromDiff<[ParticipantDiffHierarchy]>[0];

export type ParticipantHierarchy = Hierarchy<
	Participant,
	[
		Hierarchy<Class, [Hierarchy<Class>]>, //
		Hierarchy<Student, [Hierarchy<Student, [Hierarchy<Student>]>]>,
		Hierarchy<Teacher>,
		Hierarchy<Room>
	]
>;

type Success1 = UhOh extends ParticipantHierarchy ? true : false;
type Success2 = ParticipantHierarchy extends UhOh ? true : false;

type Success = Success1 extends true ? Success2 extends true ? true : false : false;

const Succ: Success = true;
const Fail: Success = false;

console.log(Succ, Fail);


const diffs: ParticipantDiffHierarchy = {
// const diffs: UhOh = [{
	getGroupName: (): keyof Dictionary => "Everyone",

	/** initial `isDifferent` does not matter */
	isDifferent: () => false,
	children: [
		{
			getGroupName: (): keyof Dictionary => "Classes",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
			children: [
				{
					getGroupName: (p0: Class) => p0.classNum.toString(),
					isDifferent: (p, q) => p.classNum !== q.classNum,
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
						},
					],
				},
			],
		},
		{
			getGroupName: (): keyof Dictionary => "Teachers",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
		},
		{
			getGroupName: (): keyof Dictionary => "Rooms",
			isDifferent: (p, q) => p.labels[0] !== q.labels[0],
		},
	],
};

console.log("diffs", diffs);

/**
 * TODO: binary search to find indices & use `.slice`
 */

// const createHierarchy = <T, D extends ParticipantDiffHierarchy, H extends ParticipantHierarchy>(
// 	differentiators: D,
// 	currentItems: T[]
// ): H => {

// const createHierarchy = <T, D extends Diff<T, any, any[]>, H extends Hierarchy<T>>(

// const createHierarchy = <T, D extends Diff<T, any, any[]>>(
// 	differentiators: D,
// 	currentItems: T[]
// ): ParseHierarchyFromDiff<[D]> => {

export const createHierarchy = <T, D extends Diff<T, any>>(
	differentiators: D,
	currentItems: T[]
): ParseHierarchyFromDiff<[D]> => {
	console.log("diffs", differentiators);

	if (!differentiators.children) {
		return [];
		// return {
		// 	currentItems,
		// 	groupName: differentiators.getGroupName(currentItems[0]),
		// };
	}

	const newItemGroups = [];
	let newItems = [];
	let groupIdx = 0;

	for (let i = 0; i < currentItems.length - 1; i++) {
		const curr = currentItems[i];
		const next = currentItems[i + 1];
		const child = differentiators.children[groupIdx]; // TODO
		// console.log("groupIdx", groupIdx, "child", curr, next, child.getGroupName(currentItems[0]));
		const {isDifferent} = child;

		newItems.push(curr);

		if (isDifferent(curr, next)) {
			newItemGroups.push(newItems);
			newItems = [];
			groupIdx++;
			console.log("groupIdx after ++", groupIdx, "i", i, "currentItems.length", currentItems.length);
		}
	}

	newItems.push(currentItems[currentItems.length - 1]);
	newItemGroups.push(newItems);

	console.log("groups", newItemGroups.map(g => g.length));

	const c = differentiators.children;

	return {
		currentItems,
		groupName: differentiators.getGroupName(currentItems[0]),
		children: [
			// ...newItemGroups.map((newItems, groupIdx) => createHierarchy(differentiators.children[groupIdx], newItems)),
			...newItemGroups.map((newItems, currGroupIdx) => createHierarchy(c[currGroupIdx], newItems)),
		],
	};
};

const hierarchy: UhOh[] = createHierarchy(diffs, participants);

// console.log("hierarchy!!!", hierarchy);


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

// // hierarchy(differenciators)(participants).map(hierarchy());

// for (const isDifferentGroup of differenciators) {
// 	const groupIdx = 0;
// 	const getGroupName = isDifferentGroup[groupIdx][0];
// 	const isDifferent = isDifferentGroup[groupIdx][1];
// 	hierarchy(isDifferent);
// }

export {};
