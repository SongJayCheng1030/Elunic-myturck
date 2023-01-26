const ISO6391 = require('iso-639-1');

export function mixedToIso639Code(input: unknown, fallback = 'en'): string {
  const sanitizedInput = `${input || ''}`.trim().toLowerCase();

  // Already correct?
  if (ISO6391.validate(sanitizedInput)) {
    return sanitizedInput; // OK
  }

  const checkCombiFormat = sanitizedInput.match(/([a-z]{2,})[\-_]([a-z]{2,})/);
  if (checkCombiFormat) {
    if (ISO6391.validate(checkCombiFormat[1])) {
      return checkCombiFormat[1];
    }
  }

  // Cannot identify or empty
  if (!ISO6391.validate(fallback)) {
    throw new Error(`Cannot parse language code: "${sanitizedInput}" nor fallback: "${fallback}"`);
  }

  return fallback;
}

export function mixedToCombinedCodeDash(input: unknown, fallback = 'en-US'): string {
  const sanitizedInput = `${input || ''}`.trim().toLowerCase();

  const checkCombiFormat = sanitizedInput.match(/([a-z]{2,})[\-_]([a-z]{2,})/);
  if (checkCombiFormat) {
    if (ISO6391.validate(checkCombiFormat[1])) {
      return `${checkCombiFormat[1]}-${checkCombiFormat[2].toUpperCase()}`;
    }
  }

  return fallback;
}

export function mixedToCombinedCodeLowdash(input: unknown, fallback = 'en-US'): string {
  const ret = mixedToCombinedCodeDash(input, fallback).replace('-', '_');

  const checkCombiFormat = ret.match(/([a-zA-Z]{2,})[\-_]([a-zA-Z]{2,})/);
  if (checkCombiFormat) {
    return `${checkCombiFormat[1].toLowerCase()}_${checkCombiFormat[2].toUpperCase()}`;
  }

  return ret;
}

export function getISO6391CodeOnlyLowerCase(input: unknown, fallback = 'en'): string {
  const ret = mixedToCombinedCodeLowdash(input, fallback);
  const idx = ret.indexOf('_');
  if (idx > 1) {
    return ret.substring(0, idx).toLowerCase();
  } else {
    return fallback.toLowerCase();
  }
}
