import { CreateTileConfiguration } from './CreareTileConfiguration';

export const MULTITENANT_TILES: CreateTileConfiguration[] = [
  {
    tileName: 'Tenant',
    desc: 'Tenant-Verwaltung',
    appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4204' : 'tenant',
    iconUrl: '',
    tileColor: '#ffffff',
    tileTextColor: '#000000',
    order: 1,
    show: 1,
    integratedView: false,
  },
];

export const DEFAULT_TILES: CreateTileConfiguration[] = [
  {
    tileName: 'Assets',
    desc: 'Asset-Verwaltung',
    appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4200' : 'asset-manager',
    iconUrl: '',
    tileColor: '#ffffff',
    tileTextColor: '#000000',
    order: 1,
    show: 1,
    integratedView: false,
  },
  {
    tileName: 'Dokumente',
    desc: 'Dokumentenverwaltung',
    appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4201' : 'documents',
    iconUrl: '',
    tileColor: '#ffffff',
    tileTextColor: '#000000',
    order: 1,
    show: 1,
    integratedView: false,
  },
  {
    tileName: 'Benutzerverwaltung',
    desc: 'Benutzerverwaltung',
    appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4203' : 'user',
    iconUrl: '',
    tileColor: '#ffffff',
    tileTextColor: '#000000',
    order: 1,
    show: 1,
    integratedView: false,
  },
];
