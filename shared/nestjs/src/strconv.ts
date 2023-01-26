import { MultilangValue } from 'shared/common/models';

import { extractFromMultiLangWithFallback } from '.';
import { mixedToCombinedCodeLowdash } from './iso639Util';

/**
 * Returns the boolean value represented by the input data.
 * It accepts `1, t, T, TRUE, true, True, on, On, yes, Yes` for
 * <code>true</code> and `0, f, F, FALSE, false, False, off, Off, No, no` for
 * <code>false</code>. Any other value is parsed as <code>false</code>.
 *
 * @param input The input data to be parsed to a boolean
 */
export function ParseBool(input: unknown): boolean {
  if (input === null || input === undefined) {
    return false;
  }

  if (typeof input === 'boolean') {
    return input as boolean;
  }

  const inputString = `${input || ''}`.trim().toLowerCase();
  if (['1', 't', 'true', 'on', 'yes'].includes(inputString)) {
    return true;
  } else if (['0', 'f', 'false', 'off', 'no'].includes(inputString)) {
    return false;
  }

  return false; // Default fallback is always false
}

/**
 * Parses a string, suspected to be a i18n language string into the format:
 * <code>
 * [ISO 639-1 language code, 2 chars, lowercase]-[ISO 3166-1 region code, uppercase]
 * </code>
 * with a fallback value (`en-US`). Please note, that this function returns
 * the "unofficial" version with an underscore ("_"), so for example `en_US`.
 *
 * @param input The input "whatever" to parse
 * @param fallback The fallback language, `en-US`
 * @returns The language string in the specified format with an underscore
 */
export function ParseI18nLangLowdash(input: unknown, fallback = 'en-US'): string {
  return mixedToCombinedCodeLowdash(input, fallback);
}

/**
 * Extracts a string from a multilang field.
 * Tries to find a specific key, if not available, tries via fallbackkey or return the key at position [0] as last fallback.
 * For valid multilang objects, this will avoid 'N/A' results when possible.
 *
 * @param input The MultiLang object or a compatible value
 * @param key The initial language key to extract
 * @param fallbackKey A fallback language key to extract if everything fails
 */
export function ParseMultiLangToString(
  input: unknown,
  key: string,
  fallbackKey?: string | null,
): string {
  return extractFromMultiLangWithFallback(
    input as string | null | undefined | MultilangValue,
    key,
    fallbackKey || null,
  );
}
