import { MultilangValue } from 'shared/common/models';

export interface FacadeDto {
  id: string;
  name: MultilangValue;
  type: 'GRAFANA_BUILDING_SET' | 'OEE_MONITORING' | 'MAINTENANCE_MONITORING';
  urlPath: string;
  iconUrl: string;
}
