"use strict";
/* @ts-nocheck */
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.createHierarchy = void 0;
// const { participants } = JSON.parse(fs.readFileSync("res2.json", { encoding: "utf-8" }));
var participants = []; // TODO FIXME
console.log("participants.length", participants.length);
var Succ = true;
var Fail = false;
console.log(Succ, Fail);
var diffs = {
    // const diffs: UhOh = [{
    getGroupName: function () { return "Everyone"; },
    /** initial `isDifferent` does not matter */
    isDifferent: function () { return false; },
    children: [
        {
            getGroupName: function () { return "Classes"; },
            isDifferent: function (p, q) { return p.labels[0] !== q.labels[0]; },
            children: [
                {
                    getGroupName: function (p0) { return p0.classNum.toString(); },
                    isDifferent: function (p, q) { return p.classNum !== q.classNum; }
                },
            ]
        },
        {
            getGroupName: function () { return "Students"; },
            isDifferent: function (p, q) { return p.labels[0] !== q.labels[0]; },
            children: [
                {
                    getGroupName: function (student) { return student.classNum.toString(); },
                    isDifferent: function (s1, s2) { return s1.classNum !== s2.classNum; },
                    children: [
                        {
                            getGroupName: function (student) { return student.classChar; },
                            isDifferent: function (s1, s2) { return s1.classChar !== s2.classChar; }
                        },
                    ]
                },
            ]
        },
        {
            getGroupName: function () { return "Teachers"; },
            isDifferent: function (p, q) { return p.labels[0] !== q.labels[0]; }
        },
        {
            getGroupName: function () { return "Rooms"; },
            isDifferent: function (p, q) { return p.labels[0] !== q.labels[0]; }
        },
    ]
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
var createHierarchy = function (differentiators, currentItems) {
    if (!differentiators.children) {
        return;
        // return {
        // 	currentItems,
        // 	groupName: differentiators.getGroupName(currentItems[0]),
        // };
    }
    var newItemGroups = [];
    var newItems = [];
    var groupIdx = 0;
    for (var i = 0; i < currentItems.length - 1; i++) {
        var curr = currentItems[i];
        var next = currentItems[i + 1];
        var isDifferent = differentiators.children[groupIdx].isDifferent; // TODO
        newItems.push(curr);
        if (isDifferent(curr, next)) {
            newItemGroups.push(newItems);
            newItems = [];
            groupIdx++;
        }
    }
    newItems.push(currentItems[currentItems.length - 1]);
    newItemGroups.push(newItems);
    var c = differentiators.children;
    return {
        currentItems: currentItems,
        groupName: differentiators.getGroupName(currentItems[0]),
        children: __spreadArray([], newItemGroups.map(function (newItems, groupIdx) { return exports.createHierarchy(c[groupIdx], newItems); }))
    };
};
exports.createHierarchy = createHierarchy;
var hierarchy = exports.createHierarchy(diffs, participants);
console.log("hierarchy!!!", hierarchy);
