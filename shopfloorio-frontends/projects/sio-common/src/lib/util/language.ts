/** The last entry will be the actual default language.
 *
 * Can be used to set the default language to each once,
 * so that changing the lannguage also works from submodules
 *
 * `FRONTEND_LANGUAGE_PRELOAD_ORDER.forEach(lang => this.translate.setDefaultLang(lang));`
 * */
export const FRONTEND_LANGUAGE_PRELOAD_ORDER = ['de_DE', 'en_EN'];
export const FRONTEND_DEFAULT_LANGUAGE = FRONTEND_LANGUAGE_PRELOAD_ORDER.slice(-1)[0];
