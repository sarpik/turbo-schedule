/* @ts-nocheck */

/* eslint-disable prettier/prettier */

// import fs from "fs";

import { Participant, Class, Student, Teacher, Room } from "@turbo-schedule/common";

// import { Dictionary } from "../../../client/src/i18n/i18n";
type Dictionary = Record<string, string>; // TODO FIXME

// const { participants } = JSON.parse(fs.readFileSync("res2.json", { encoding: "utf-8" }));
const participants: Participant[] = []; // TODO FIXME
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

type Diff<
	P, //
	Q,
	C extends Diff<any, any, any[]>[] = [] // TODO: Remove Array and make `Diff` an array be default
	// D = [] extends C ? never : C
> = [] extends C
	? {
			// // getGroupName(firstGroupEntry: P): keyof Dictionary;
			// getGroupName(): keyof Dictionary;
			// getGroupName(firstGroupEntry: P): string;
			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
			isDifferent(p: P, q: Q): boolean;
			children: C; // TODO REMOVE
	  }
	: {
			// // getGroupName(firstGroupEntry: P): keyof Dictionary;
			// getGroupName(): keyof Dictionary;
			// getGroupName(firstGroupEntry: P): string;
			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
			isDifferent(p: P, q: Q): boolean;
			children: C;
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

export type ParseHierarchyFromDiff<
	DS extends (Diff<any, any, any[]>)[] //
> =
	//  D extends Diff<infer P, infer _Q, infer C>
	// ?
	DS extends  []
	// readonly [] extends DS
		? DS
		: DS extends Diff<any, any, Diff<any, any, any[]>[]>[]
		? DS extends (readonly [infer DiffFirst, ...infer DiffRest] | readonly [(infer DiffFirst)?, ...infer DiffRest]) // eslint-disable-line prettier/prettier
			? DiffFirst extends Diff<any, any, any[]>
				? DiffFirst extends Diff<infer PP, any, infer DSS> // ? PP extends P // ? Hierarchy<P, [Hierarchy<PP>, ...ParseHierarchyFromDiff<Crest>]>
					// ? DiffRest extends []  // Array<Diff<any, any, any[]>>
					// ? DiffRest extends Diff<any, any, any[]>[]
					// ? DiffRest extends  any[]
					? DiffRest extends  any[]
					  /**
					   * `DiffRest` is empty, meaning
					   *  we have only one child left in the current hierarchy path
					   */
						? [
								Hierarchy<PP, ParseHierarchyFromDiff<DSS>>, //
								...ParseHierarchyFromDiff<DiffRest>
						  ]
						// : DiffRest extends any[]
						// ?
						  : DiffRest extends Diff<any, any, any[]>[]
						  ?
						  [
								Hierarchy<PP, ParseHierarchyFromDiff<DSS>>, //,
								...ParseHierarchyFromDiff<DiffRest>
						  ]
						// : 5
					: DS extends [infer _DiffFirst, ...infer DiffRestNew]
						? DiffRestNew extends any[]
							? ["good"]
							: [6]
						: [5]
					: [4]
				: [3]
			: [2]
		: [1];
		// 					: never
		// 				: never
		// 			: never
		// 		: never
		// 	:  never
		// : never;

type UhOh = ParseHierarchyFromDiff<[ParticipantDiffHierarchy]>;

export type ParticipantHierarchy = Hierarchy<
	Participant,
	[
		Hierarchy<Class, [Hierarchy<Class>]>, //
		Hierarchy<Student, [Hierarchy<Student, [Hierarchy<Student>]>]>,
		Hierarchy<Teacher>,
		Hierarchy<Room>
	]
>;

const diffs: ParticipantDiffHierarchy = {
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

const createHierarchy = <T, D extends Diff<T, any, any[]>, H extends Hierarchy<T>>(
	differentiators: D,
	currentItems: T[]
): H => {
	// const createHierarchy = <T, D extends ParticipantDiffHierarchy, H extends ParticipantHierarchy>(
	// 	differentiators: D,
	// 	currentItems: T[]
	// ): H => {
	if (!differentiators.children) {
		return {
			currentItems,
			groupName: differentiators.getGroupName(currentItems[0]),
		};
	}

	const newItemGroups = [];
	let newItems = [];
	let groupIdx = 0;

	for (let i = 0; i < currentItems.length - 1; i++) {
		const curr = currentItems[i];
		const next = currentItems[i + 1];
		const { isDifferent } = differentiators.children[groupIdx]; // TODO

		newItems.push(curr);

		if (isDifferent(curr, next)) {
			newItemGroups.push(newItems);
			newItems = [];
			groupIdx++;
		}
	}

	newItems.push(currentItems[currentItems.length - 1]);
	newItemGroups.push(newItems);

	return {
		currentItems,
		groupName: differentiators.getGroupName(currentItems[0]),
		children: [
			...newItemGroups.map((newItems, groupIdx) => createHierarchy(differentiators.children[groupIdx], newItems)),
		],
	};
};

console.log("! hierarchy", createHierarchy);

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
