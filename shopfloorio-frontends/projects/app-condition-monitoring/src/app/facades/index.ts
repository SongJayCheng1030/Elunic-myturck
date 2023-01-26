import { InjectionToken } from '@angular/core';
import { MultilangValue } from 'shared/common/models';

export const FACADE_LISTS = new InjectionToken<Facade[]>('app.facades');

export interface Facade {
  path?: string;
  name?: MultilangValue;
  type: string;
  moduleName: string;
  importedModule: Promise<FacadeModule>;
}

export interface FacadeModule {}

export const FACADES: Facade[] = [
  {
    type: 'GRAFANA_BUILDING_SET',
    moduleName: 'GrafanaBuildingSetModule',
    importedModule: import('./grafana-building-set/grafana-building-set.module'),
  },
  {
    type: 'OEE_MONITORING',
    moduleName: 'OeeMonitoringModule',
    importedModule: import('./oee-monitoring/oee-monitoring.module'),
  },
  {
    type: 'MAINTENANCE_MONITORING',
    moduleName: 'MaintenanceMonitoringModule',
    importedModule: import('./maintenance-monitoring/maintenance-monitoring.module'),
  },
];

export const FACADE_SETTINGS: Facade[] = [
  {
    type: 'CONFIG_MANAGEMENT',
    path: 'config-management',
    name: {
      de_DE: 'Konfigurationsverwaltung',
      en_US: 'Config management',
    },
    moduleName: 'ConfigManagementModule',
    importedModule: import('./config-management/config-management.module'),
  },
];
