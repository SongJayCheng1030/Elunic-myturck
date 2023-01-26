export interface ActiveAppFacade {
  id: string;
  name: {
    [key: string]: string;
  };
  type: string;
  urlPath: string;
  icon: string;
}
