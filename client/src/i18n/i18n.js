"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const en_1 = require("./en");
const lt_1 = require("./lt");
__export(require("./en"));
__export(require("./lt"));
exports.translations = {
    en: en_1.en,
    lt: lt_1.lt,
};
exports.defaultLang = "lt";
exports.availableLangs = Object.keys(exports.translations).map((translation) => translation);
const localStorageIdentifier = "lang";
exports.setLang = (newLang) => {
    localStorage.setItem(localStorageIdentifier, newLang);
};
exports.getLang = () => {
    const currentLang = localStorage.getItem(localStorageIdentifier);
    if (exports.availableLangs.includes(currentLang)) {
        return currentLang;
    }
    return exports.defaultLang;
};
//# sourceMappingURL=i18n.js.map