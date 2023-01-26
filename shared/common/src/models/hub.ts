import { MultilangValue } from './MultilangValue';

export interface TileConfigurationDto {
  id: number;
  tileName: string;
  desc: string;
  appUrl: string;
  iconUrl: string;
  tileColor: string;
  tileTextColor: string;
  order: number;
  show: number;
  integratedView: boolean;
}

export interface CreateTileConfigurationDto {
  tileName: string;
  desc: string;
  appUrl: string;
  iconUrl: string;
  tileColor: string;
  tileTextColor: string;
  order: number;
  show: number;
}

export interface GeneralConfiguration {
  key: string;
  value?: string | number | null;
  id: number;
}

export interface AppSwitcherApp {
  name: MultilangValue | string;
  url: string | string[];
  icon?: string | null | undefined;
}

export interface SettingsItem {
  appUrl: string;
  tileName: string;
  mode?: string;
}
