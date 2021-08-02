import { useContext } from "react";

import { ICurrentLangContext, CurrentLangContext } from "../components/currentLangContext/currentLangContext";

import { translations, ITranslations } from "./i18n";
import { Dictionary } from "./Dictionary";

/**
 * for tinkering
 * TODO - OSS lib?
 * Already been done xoxo (probably, `i18n-ts`)
 */

// export interface ITranslations {
// 	[key: string]: ITranslation;
// }

export const _useTranslation = <Translations extends ITranslations>(
	_CurrentLangContext: ICurrentLangContext,
	_translations: Translations
) => {
	const { currentLang } = useContext(_CurrentLangContext);

	const translation: Dictionary = _translations[currentLang];

	// const tuple = <T extends Array<Dictionary>>(...args: T) => args;
	// const Itranslations = tuple(Object.values(translations).map((t: Dictionary) => t));
	// type LangsLiterals = typeof Itranslations[number];

	// const furniture = <const>[Object.values(translations).map((dict: Dictionary) => Object.keys(dict))];
	// type Dicts = typeof furniture[number];

	/**
	 * lookup types:
	 * https://mariusschulz.com/blog/keyof-and-lookup-types-in-typescript
	 */
	// const selectTranslation = <K extends keyof typeof translation>(key: K | Dicts) => {

	// const selectTranslation = <K extends keyof typeof translation>(key: K ) => {
	// 	let realKey: K;

	// 	realKey = key;

	// 	const translationText = translation[realKey];
	// 	return translationText;
	// };

	/**
	 * TODO - t`<translationText>` with generic TemplateStringsArray
	 * (it's not generic ffs!)
	 */
	const selectTranslation = <K extends keyof Dictionary>(key: K | Array<K>): Dictionary[K] => {
		let realKey: K;

		if (Array.isArray(key)) {
			realKey = key[0];
		} else {
			realKey = key;
		}

		const translationText: Dictionary[K] = translation[realKey];
		return translationText;
	};

	return selectTranslation;
};

/**
 * @function useTranslation
 *
 * @description
 * @usage
 *
 * ```ts
 * const t = useTranslation()
 *
 * t("<translatedTextKey>")
 *
 * t("<translatedTextKeyWhichReturnsAFunction>")(...args)
 * ```
 */
export const useTranslation = () => _useTranslation(CurrentLangContext, translations);

export type Translator = ReturnType<typeof useTranslation>;

// const t = useTranslation();

// const foo = t`foobar`;

// const b = foo;

// const gql: (literals: Array<string>, ...placeholders: Array<any>) => any = function() {
// 	const args = Array.prototype.slice.call(arguments);
// 	const literals = args[0];
// };

// gql`foo`

// const gql = function (){ return Array.prototype.splice.apply(arguments)}

// const foobar = gql`hello`;
