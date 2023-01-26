import * as Joi from 'joi';
import { MultilangValue } from 'shared/common/models';

export function MultilangJoiSchema() {
  return Joi.object().pattern(
    /[a-zA-Z]{2}(_|\-)[a-zA-Z]{2,3}/,
    Joi.alternatives(null, Joi.string().max(1024)),
  );
}

// import { MultilangValue } from '../types';

export function asMultilangResultJSON(input: string | null | { [key: string]: string }): {
  [key: string]: string;
} {
  if (!input) {
    return { de_DE: '' };
  }

  if (typeof input === 'string') {
    // It might be that JSON values are saved in this
    // multilang values on every places where the frontend
    // does not yet support translated strings, therefore
    // try to parse it as a JSON first
    try {
      const value = JSON.parse(input);
      if (typeof value === 'string') return { de_DE: `${value}` };
      if (typeof value === 'object') return value;
    } catch (ex) {
      return { de_DE: `${input}` };
    }
  }

  return input as { [key: string]: string }; // Assuming a correct response entity
}

export function combineMultilangValues(
  originalMultilang: string | null | { [key: string]: string },
  newValue: string | null | { [key: string]: string },
  defaultLanguageKey = 'de_DE',
): { [key: string]: string } {
  const original = asMultilangResultJSON(originalMultilang);

  if (typeof newValue === 'string') {
    original[defaultLanguageKey] = newValue;
    return original;
  }

  return {
    ...original,
    ...asMultilangResultJSON(newValue),
  };
}

export function toMultiLangTitle(
  anyInput: string | null | undefined | MultilangValue,
): MultilangValue {
  try {
    if (anyInput && typeof anyInput === 'object' && Object.keys(anyInput).length > 0) {
      return anyInput as MultilangValue;
    }
  } catch (ex) {
    // Error: can be ignored
  }

  try {
    const obj = JSON.parse(`${anyInput}`);

    const keys = Object.keys(obj);
    if (!keys.includes('de_DE') && !keys.includes('en_US')) {
      throw new Error();
    }

    return obj;
  } catch (ex) {
    // Error: can be ignored
  }

  return {
    de_DE: 'N/A',
    en_US: 'N/A',
  };
}

export function extractFromMultiLangTitle(
  anyInput: string | null | undefined | MultilangValue,
  anyKey: string,
): string {
  const titles = toMultiLangTitle(anyInput);

  if (anyKey in titles) {
    return titles[anyKey];
  }

  if (anyKey.toLowerCase() in titles) {
    return titles[anyKey.toLowerCase()];
  }

  const keys = Object.keys(titles);
  if (keys.length < 1) {
    return 'N/A';
  }

  return titles[keys[0]];
}

/**
 * Extracts a string from a multilang field.
 * Tries to find a specific key, if not available, tries via fallbackkey or return the key at position [0] as last fallback.
 * For valid multilang objects, this will avoid 'N/A' results when possible.
 * @param anyInput
 * @param anyKey
 * @param fallbackKey
 * @deprecated Please use `strconv.ParseMultiLangToString`
 */
export function extractFromMultiLangWithFallback(
  anyInput: string | null | undefined | MultilangValue,
  anyKey: string,
  fallbackKey: string | null = null,
): string {
  let result;
  // expecting a multilang object
  try {
    if (anyInput && typeof anyInput === 'object' && Object.keys(anyInput).length > 0) {
      result = anyInput as MultilangValue;
    }
  } catch (ex) {
    // Error: can be ignored
  }
  // if not, fallback to finding any data
  if (!result) {
    return extractFromMultiLangTitle(anyInput, anyKey);
  }

  // otherwhise try to find the actual key or fallback to inital
  if (anyKey in result) {
    return result[anyKey];
  }
  if (fallbackKey && fallbackKey in result) {
    return result[fallbackKey];
  }
  return result[Object.keys(result)[0]] || '';
}
