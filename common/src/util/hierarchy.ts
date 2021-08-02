import { Participant, Class, Student, Teacher, Room } from "..";

type Dictionary = Record<string, string>; // TODO FIXME

type Diff<
	P, //
	Q,
	C extends Diff<any, any, any[]>[] = Diff<any, any, any[]>[] // TODO: Remove Array and make `Diff` an array be default (((OR NOT)))
	> = [] extends C
?
	{
			// getGroupName(firstGroupEntry: P): keyof Dictionary;
			// getGroupName(firstGroupEntry: P): string;
			debug?: any;
			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
			isDifferent(p: P, q: Q): boolean;
			children?: C; // TODO: disabled ??
			useSingleChildDifferForAllGroups: boolean /**
			 * TODO (optional, default to false, make sure to verify that either
				* a) the number of groups created is === children.length,
				or b) the `useSingleChildDifferForAllGroups` is `true`
				     and length of `children` is 1 (?)
			 */
	  }
	:
	{
			// getGroupName(firstGroupEntry: P): keyof Dictionary;
			// getGroupName(firstGroupEntry: P): string;
			debug?: any;
			getGroupName(firstGroupEntry: P): keyof Dictionary | string;
			isDifferent(p: P, q: Q): boolean;
			children?: C;
			useSingleChildDifferForAllGroups: boolean /**
			 * TODO (optional, default to false, make sure to verify that either
				* a) the number of groups created is === children.length,
				or b) the `useSingleChildDifferForAllGroups` is `true`
				     and length of `children` is 1 (?)
			 */
	  };

export type ParticipantDiffHierarchy = Diff<
	Participant,
	Participant,
	[
		Diff<Class, Class, [Diff<Class, Class>]>, //
		Diff<Student, Student, [Diff<Student, Student, [Diff<Student, Student>]>]>,
		Diff<Teacher, Teacher>,
		Diff<Room, Room>
	]
>;

// type AAAAA = ParseHierarchyFromDiff<[Diff<Participant, Participant, [
// 	Diff<Class, Class, [Diff<Class, Class>]>,
// 	Diff<Student, Student, [Diff<Student, Student, [Diff<Student, Student>]>]>,
// 	Diff<Teacher, Teacher>,
// 	Diff<Room, Room>
// ]>]>

// DO NOT make optional
export type Hierarchy<T, C extends Hierarchy<T>[] = []> = [] extends C
	? {
		debug?: any;
			groupName: string;
			currentItems: T[];
	  }
	: {
		debug?: any;
			groupName: string;
			currentItems: T[];
			children: C;
	  };

// BAD IDEA!
// export type Hierarchy<T, C extends Hierarchy<T>[] = []> =
// 	 {
// 		debug?: any;
// 			groupName: string;
// 			currentItems: T[];
// 			children?: C;
// 	  }

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
	  				? DSS extends Diff<any, any, any[]>[]
					  ? DiffRest extends Diff<any, any, any[]>[] // auxilary verification
					  // ? DiffRest extends undefined ? DiffRest :

					  ? ParseHierarchyFromDiff<DSS> extends Hierarchy<PP>[] // auxilary verification + explicit verification of will/will not have children
					  ? [] extends DiffRest // recursion exit condition - empty array
					  /**
					   * `DiffRest` is empty, meaning
					   *  we have only one child left in the current hierarchy path
					   */
						? [
									Hierarchy<PP, ParseHierarchyFromDiff<DSS>> // has children, empty
							]
								:
							[
									Hierarchy<PP, ParseHierarchyFromDiff<DSS>>, // has children, not empty
									...ParseHierarchyFromDiff<DiffRest>
							]
							: [] extends DiffRest
								? [
								Hierarchy<PP, []>,
								// ...ParseHierarchyFromDiff<DiffRest> // not has children, ~~empty/not empty~~ empty
							]  : [
								Hierarchy<PP, []>,
								...ParseHierarchyFromDiff<DiffRest> // not has children, ~~empty/not empty~~ not empty
							]

							:never
						: never
					: never
				: never
			:  never
		: never;

/**
 * TODO: Add the following segment to test the types themselves
 */

export type ParticipantHierarchyManual = Hierarchy<
	Participant,
	[
		Hierarchy<Class, [Hierarchy<Class>]>, //
		// Hierarchy<Class>, //
		Hierarchy<Student, [Hierarchy<Student, [Hierarchy<Student>]>]>,
		// Hierarchy<Student, [Hierarchy<Student>]>,
		// Hierarchy<Teacher>,
		Hierarchy<Teacher>,
		// Hierarchy<Room>
		Hierarchy<Room>
	]
> | null;

// type Success1 = ParticipantHierarchy extends ParticipantHierarchyManual ? true : false;
// type Success2 = ParticipantHierarchyManual extends ParticipantHierarchy ? true : false;

// type Success = Success1 extends true ? Success2 extends true ? true : false : false;
// type Fail = Success extends true ? false : true;

// /** should not error */
// const _Succ: Success = true;
// /** should not error */
// const _Fail: Fail = false;

// const noop = (_x: any) => {};

// noop(_Succ);
// noop(_Fail);

// diffs
export const participantDifferenciators: ParticipantDiffHierarchy = {
	getGroupName: (): keyof Dictionary => "Everyone",

	isDifferent: (p, q) => p.labels[0] !== q.labels[0],

	useSingleChildDifferForAllGroups: false,
	children: [
		{
			debug: "classes",
			getGroupName: (): keyof Dictionary => "Classes",
			isDifferent: (p, q) => p.classNum !== q.classNum,
			useSingleChildDifferForAllGroups: true,
			children: [
				{
					debug: "classes 5-10",
					getGroupName: (p0: Class) => p0.classNum?.toString() ?? "ERROR",
					// isDifferent: (p, q) => p.classNum !== q.classNum,
					isDifferent: () => false,
					useSingleChildDifferForAllGroups: true,
				},
			],
		},
		{
			debug: "students",
			getGroupName: () => "Students",
			isDifferent: (s1, s2) => s1.classNum !== s2.classNum,
			useSingleChildDifferForAllGroups: true,
			children: [
				{
					debug: "students 11-12",
					getGroupName: (student) => student.classNum?.toString().toUpperCase() ?? "ERROR",
					isDifferent: (s1, s2) => s1.classChar !== s2.classChar,
					useSingleChildDifferForAllGroups: true,
					children: [
						{
							debug: "students a-e",
							getGroupName: (student) => student?.classChar ?? "ERROR",
							isDifferent: () => false,
							useSingleChildDifferForAllGroups: true
						},
					],
				},
			],
		},
		{
			debug: "teachers",
			getGroupName: (): keyof Dictionary => "Teachers",
			isDifferent: () => false,
			useSingleChildDifferForAllGroups: true,
		},
		{
			debug: "rooms",
			getGroupName: (): keyof Dictionary => "Rooms",
			isDifferent: () => false,
			useSingleChildDifferForAllGroups: true,
		},
	],
};

export const createHierarchy = <
	T,
	// C extends Diff<any, any, any[]>[], // = Diff<any, any, any[]>[],
	D extends Diff<T, T, any[]> // = Diff<T, T, C>
	// D extends Diff<T, T, Diff<any, any, any>[]> // = Diff<T, T, C>

	// C extends Diff<any, any, any[]>[], // = Diff<any, any, any[]>[],
	// D extends Diff<T, T, C> // = Diff<T, T, C>
>(
	differentiators: D) => (
	currentItems: T[]
	// currentItems: ParseHierarchyFromDiff<[D]>[0]["currentItems"] // TODO
): ParseHierarchyFromDiff<[D]>[0] | null => {
	if (!currentItems?.length) {
		console.warn("createHierarchy: currentItems.length falsy")
		return null;
	}

	const newItemGroups: T[][] = [];
	let newItems: T[] = [];
	// let groupIdx = 0;

	for (let i = 0; i < currentItems.length - 1; i++) {
		const curr = currentItems[i];
		const next = currentItems[i + 1];

		const {isDifferent} = differentiators;

		// const child = differentiators.children[groupIdx]; // TODO
		// // console.log("groupIdx", groupIdx, "child", curr, next, child.getGroupName(currentItems[0]));
		// const {isDifferent} = child;

		newItems.push(curr);

		if (isDifferent(curr, next)) {
			newItemGroups.push(newItems);
			newItems = [];
			// if (!differentiators.useSingleChildDifferForAllGroups) {
			// 	groupIdx++;
			// }
			// console.log("groupIdx after ++", groupIdx, "i", i, "currentItems.length", currentItems.length); // TODO remove groupIdx
		}
	}

	newItems.push(currentItems[currentItems.length - 1]);
	newItemGroups.push(newItems);

	if (!differentiators?.children?.length) {
		return {
			debug: differentiators.debug,
			groupName:  differentiators.getGroupName(currentItems[0]),
			currentItems: currentItems
		};
	}

	const { children } = differentiators;

	if (children.length === 0) {
		throw new Error("differentiators.children cannot be of length 0")
	}

	let parsedChildren = [];
	const useSingleChildDifferForAllGroups: boolean = children.length === 1;

	if (useSingleChildDifferForAllGroups) {
		if (children.length !== 1) {
			parsedChildren = [{debug: (`ERR children length must be 1 (${children.length})`)}];
		} else {
			parsedChildren = newItemGroups.map((group) => createHierarchy(children[0])(group));
		}
	} else {
		if (children.length !== newItemGroups.length) {
			parsedChildren = [{debug: `ERR children and newItemGroups lengths do not match (${children.length}, ${newItemGroups.length})`}];
		} else {
			parsedChildren = children.map((child, idx) => createHierarchy(child)(newItemGroups[idx])) // `newItemGroups` <-> identical to `[currentItems]`
		}
	}

	return {
		debug: differentiators.debug,
		groupName: differentiators.getGroupName(currentItems[0]),
		children: parsedChildren,
		currentItems
	} as ParseHierarchyFromDiff<[D]>[0] | null; // `children` fix
};

type ParticipantHierarchyArr = ParseHierarchyFromDiff<[ParticipantDiffHierarchy]>;
/**
 * the only one that we actually need
 *
 * `null` only if the provided `currentItems`,
 * in this case, participants, are an empty array.
 *
 * TODO FIXME - "Type instantiation is excessively deep and possibly infinite.  TS2589"
 * TODO FIXME HACK - temporarily using the manual value instead until this is resolved
 *
 */
export type ParticipantHierarchy = ParticipantHierarchyArr[0] | null;
// export type ParticipantHierarchy = ParticipantHierarchyManual;

const createParticipantHierarchyArr = createHierarchy<Participant, ParticipantDiffHierarchy>(participantDifferenciators);
/**
 * once again - the only one that we actually need
 *
 * TODO FIXME - "Type instantiation is excessively deep and possibly infinite.  TS2589"
 * TODO FIXME HACK - temporarily using the manual value instead until this is resolved
 */
// export const createParticipantHierarchy = (currentItems: Participant[]): ParticipantHierarchy => createParticipantHierarchyArr(currentItems) ?? null
export const createParticipantHierarchy = (currentItems: Participant[]): ParticipantHierarchyManual => createParticipantHierarchyArr(currentItems) ?? null
