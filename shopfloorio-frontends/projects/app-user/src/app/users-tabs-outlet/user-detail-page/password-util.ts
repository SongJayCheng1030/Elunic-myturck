import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Logger } from '@sio/common';
import * as owasp from 'owasp-password-strength-test';

function calcPasswordStrength(pwd: string): number {
  if (!pwd || pwd.length < 1) {
    return 0;
  }

  if (pwd.length < 3) {
    return 10;
  }

  const r = owasp.test(pwd);
  let q = Math.round((r.passedTests.length / (r.passedTests.length + r.failedTests.length)) * 100);

  if (pwd.length > 1 && q < 10) {
    q = 10;
  } else if (!pwd) {
    q = 0;
  }

  return q;
}

const INVALID_PASSWORD_CHARACTERS = ['ä', 'ö', 'ü', 'ß'];

function validCharactersValidator(value: string): ValidationErrors | null {
  let invalid = false;
  for (const char of INVALID_PASSWORD_CHARACTERS) {
    if (value.toLowerCase().includes(char)) {
      invalid = true;
      break;
    }
  }
  return invalid ? { hasInvalidCharacters: true } : null;
}

const colorGrades = [
  [0, 10, 'bg-danger'],
  [10, 30, 'bg-info'],
  [30, 80, 'bg-warning'],
  [80, 101, 'bg-success'],
];

export function validatePassword(
  cb?: (strength: null | [number, object]) => void,
): (control: AbstractControl) => ValidationErrors | null {
  const logger = new Logger('validatePassword');

  return (control: AbstractControl): ValidationErrors | null => {
    // Nothing entered, nothing todo
    if (!control.value) {
      cb && cb(null);
      return null;
    }

    // Ensure password min length
    if (control.value.length < 8) {
      cb &&
        cb([
          control.value.length,
          {
            [colorGrades[0][2]]: true,
          },
        ]);
      return { lengthNotMatched: 'Min. length is 8 chars' };
    }

    const validChars = validCharactersValidator(control.value);
    if (validChars && Object.keys(validChars).length > 0) {
      logger.trace(`Invalid characters detected:`, validChars);
      cb &&
        cb([
          10,
          {
            [colorGrades[0][2]]: true,
          },
        ]);
      return validChars;
    }

    const minStrength = 42;
    const strength = calcPasswordStrength(control.value);
    const strPerc = (strength / 100) * 100;
    // @ts-ignore
    const grade = colorGrades.find(p => p[0] <= strPerc && strPerc < p[1])[2] as string;

    cb &&
      cb([
        strPerc,
        {
          [grade]: true,
        },
      ]);

    if (strength < minStrength) {
      logger.trace(`Password strength not matching:`, strength);
      return { passwordStrength: { minStrength, currentStrength: strength } };
    }

    // Everything fine
    return null;
  };
}

export function validatePasswordConfirm(
  pwdFieldName: string,
): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const ctrl = control.parent?.get(pwdFieldName);
    const val = ctrl?.value;

    if (val !== control.value) {
      return { notMatching: true };
    }

    if (!ctrl?.valid) {
      return { otherNotValid: true };
    }

    return null;
  };
}
