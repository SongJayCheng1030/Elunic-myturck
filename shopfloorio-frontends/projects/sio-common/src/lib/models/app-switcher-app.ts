import { AppSwitcherApp as Base } from 'shared/common/models';

export interface AppSwitcherApp extends Omit<Base, 'url'> {
  url: string | string[] | URL;
}
