export interface CreateTileDto {
  name: string;

  isOnAssetType: boolean;

  gfDashboardId: string;
  gfPanelId: number;

  widthUnits: number;
  heightUnits: number;
  orderIndex: number;
}
