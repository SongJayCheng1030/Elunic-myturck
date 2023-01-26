import { MachineVariableDto } from '../../machine-variable/MachineVariableDto';

export interface TileDto {
  id: string;
  name: string;
  machineVariable?: MachineVariableDto | string;
  isOnAssetType: boolean;
  gfEmbed: {
    url: string;
    params: Array<{
      type: 'var' | 'timeFrom' | 'timeTo' | 'refresh' | 'const';
      name: string;
      defaultValue: string | number | boolean | null;
    }>;
  };
  gfDashboardId: string;
  isMagicTile: boolean;
  gfPanelId: number;
  width: number;
  height: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  useVars?: boolean;
  useOwnVars?: boolean;
}
