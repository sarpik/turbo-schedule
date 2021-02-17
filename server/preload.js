/**
 * usage:
 *
 * ```sh
 * cat load.js - | node -i
 * ```
 *
 * and then
 *
 * ```sh
 * load()
 * ```
 */

console.log("module", module);

const info = `
${new Array(20).fill("\n").join("")}
----------
preload.js
----------

usage:

\`\`\`
load("./path/to/js/file", "x")
x
\`\`\`
`;

// load("../client/build/static/js/runtime-main.11652960.js")
// global['webpackJsonp@turbo-schedule/client'].push()

let loadedModuleCount = 0;

// const load = ({ entrypoint = "./dist/server", globalVarHolderName = "x" }) => {
// const load = ({ entrypoint, globalVarHolderName } = { entrypoint: "./dist/server", globalVarHolderName: "x" }) => {
const load = (entrypoint = "./dist/server", globalVarHolderName = "x") => {
	console.log("entrypoint", entrypoint, "globalVarHolderName", globalVarHolderName);
	require(entrypoint);

	// global[globalVarHolderName] = { ...global.exports }; /** probably just {} */

	loadDFS(global.module, globalVarHolderName);

	console.log(
		[
			`loaded \`${loadedModuleCount}\` modules`,
			// `created \`${Object.keys(global[globalVarHolderName]).length}\` exports`,
			// `stored in \`${globalVarHolderName}\``,
		].join("\n")
	);
};

const loadDFS = (module, globalVarHolderName) => {
	if (!module || module.path.includes("node_modules")) {
		return;
	}

	if (!globalVarHolderName) {
		throw new Error(`[load] [error] globalVarHolderName not provided (was \`${globalVarHolderName}\`)`);
	}

	loadedModuleCount++;

	console.log("module", loadedModuleCount, module.path);

	// global[globalVarHolderName] = { ...global[globalVarHolderName], ...module.exports }; /** probably just {} */
	// // global = { ...global, ...module.exports };
	Object.assign(global, module.exports);

	module.children.forEach((childModule) => {
		loadDFS(childModule, globalVarHolderName);
	});
};

console.log(info);

