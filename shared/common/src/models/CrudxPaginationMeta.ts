export interface CrudxPaginationMeta extends Record<string, unknown> {
  /**
   * Current page (starting from 1)
   */
  page: number;

  /**
   * Number of pages in total
   */
  pageCount: number;

  /**
   * The total number of results overall
   */
  total: number;

  /**
   * Number of items on the current page
   */
  count: number;
}
