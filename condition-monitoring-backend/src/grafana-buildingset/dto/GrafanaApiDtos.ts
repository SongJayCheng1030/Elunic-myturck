export interface GrafanaDashboardSerachResult {
  id: number;
  uid: string;
  title: string;
  uri: string;
  url: string;
  slug: string;
  tags: string[];
  isStarred: boolean;
  sortMeta: number;
}

export interface GrafanaDashboardDetailResult {
  meta: {
    slug: string;
    url: string;
  };
  dashboard: {
    uid: string;
    title: string;
    panels: Array<{
      id: string;
      title: string;
      type: string; // e.g. "graph", ...
    }>;
  };
  tagsParsed: {
    [key: string]: string;
  };
}
