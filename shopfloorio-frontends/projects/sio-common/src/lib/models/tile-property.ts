import { MachineVariableDto } from 'shared/common/models';

export interface TileModalResult {
  mode: 'new' | 'edit' | 'delete';
  property: TileProperty;
}

export interface TileVariable {
  key: string;
  value: string;
}

export interface TileProperty {
  id: string;
  name: string;
  machineVariable: MachineVariableDto;
  grafanaDashboard: string;
  grafanaPanel: string;
  width: number;
  height: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  isMagicTile: boolean;
  gfDashboardId: string;
  gfPanelId: number;
  useVars?: boolean;
  useOwnVars?: boolean;

  gfEmbed: {
    url: string;
    params: Array<{
      type: 'var' | 'timeFrom' | 'timeTo' | 'refresh' | 'const';
      name: string;
      defaultValue: string | number | boolean;
    }>;
  };

  heightUnits: number;
  widthUnits: number;
}

export interface Settings {
  key: string;
  value: string | number;
  description: string;
}
