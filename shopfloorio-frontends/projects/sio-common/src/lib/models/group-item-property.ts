export interface GroupItemProperty {
  id: string;
  name?: string;
  active?: boolean;
  selected?: boolean;
  children?: GroupItemProperty[];
  [key: string]: any;
}
