import { Dictionary } from "./Dictionary";
export * from "./Dictionary";
export * from "./en";
export * from "./lt";
export interface ITranslations {
    en: Dictionary;
    lt: Dictionary;
}
export declare const translations: ITranslations;
export declare type ILang = keyof ITranslations;
export declare const defaultLang: ILang;
export declare const availableLangs: Array<ILang>;
export declare const setLang: (newLang: "en" | "lt") => void;
export declare const getLang: () => "en" | "lt";
//# sourceMappingURL=i18n.d.ts.map