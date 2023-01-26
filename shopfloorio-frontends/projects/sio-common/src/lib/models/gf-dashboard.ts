export interface GfDashboardItem {
  dashboardTitle: string;
  gfDashboardId: string;
  gfPanelId: number;
  ids: {
    gfDashboardId: string;
    gfPanelId: number;
  };
  isDynamicDashboard: boolean;
  isStarred: boolean;
  orderIndex: number;
  tags: string[];
  title: string;
  uid: string;
}
