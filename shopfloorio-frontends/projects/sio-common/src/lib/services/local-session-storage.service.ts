import { Injectable } from '@angular/core';

const SF_LANGUAGE = 'sf_language';

@Injectable({
  providedIn: 'root',
})
export class LocalSessionStorageService {
  private _localStorageItems = [SF_LANGUAGE];
  private _settings: { [key: string]: string | boolean | number } = {};

  constructor() {
    this.load();
  }

  getString(key: string, defaultValue = ''): string {
    if (this._checkIfValueIsNotProvided(key, defaultValue)) this.setString(key, defaultValue);
    return this._settings[key] as string;
  }

  setString(key: string, value: string): void {
    if (this._settings[key] === value) return;

    this._settings[key] = value;
    this.store();
  }

  getNumber(key: string, defaultValue = 0): number {
    if (this._checkIfValueIsNotProvided(key, defaultValue)) this.setNumber(key, defaultValue);
    return this._settings[key] as number;
  }

  setNumber(key: string, value: number): void {
    if (this._settings[key] === value) return;

    this._settings[key] = value;
    this.store();
  }

  getBool(key: string, defaultValue = false): boolean {
    if (this._checkIfValueIsNotProvided(key, defaultValue)) this.setBool(key, defaultValue);
    return this._settings[key] as boolean;
  }

  setBool(key: string, value: boolean): void {
    if (this._settings[key] === value) return;

    this._settings[key] = value;
    this.store();
  }

  reset(): void {
    this.clear();
  }

  // Loads the config from local storage, e.g. called in constructor of service
  private load(): void {
    const settings: { [key: string]: string | boolean | number } = {};
    this._localStorageItems.forEach(key => {
      let value = localStorage.getItem(key);
      if (!value) return;

      if (this._isJsonValid(value)) {
        value = JSON.parse(value);
      }
      settings[key] = value || '';
    });
    this._settings = settings;
  }

  // Stores the config into local storage, called on every set...() function
  private store(): void {
    const keys = Object.keys(this._settings);
    keys.forEach(key => {
      const value =
        typeof this._settings[key] === 'string'
          ? this._settings[key]
          : JSON.stringify(this._settings[key]);
      localStorage.setItem(key, value as string);
    });
  }

  // Called when the user logs out, to not leave any residue if another user logs in
  private clear(): void {
    const keys = Object.keys(this._settings);
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private _isJsonValid(jsonString: string): boolean {
    try {
      const isString = typeof jsonString === 'string';
      const isJsonString = jsonString.startsWith('{') || jsonString.startsWith('[');
      if (isString && isJsonString) {
        JSON.parse(jsonString);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  private _checkIfValueIsNotProvided(key: string, value: string | boolean | number): boolean {
    return this._settings[key] === null || this._settings[key] === undefined;
  }
}
