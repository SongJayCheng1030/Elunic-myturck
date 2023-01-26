import { AssetImageMapDto, MultilangValue } from 'shared/common/models';

export interface TreeNode {
  id: string;
  name?: MultilangValue;
  description?: string | null;
  imageId?: string | null;
  imageMap?: AssetImageMapDto | null;
  expanded?: boolean;
  status?: TreeNodeStatus;
  children?: TreeNode[];
}

export interface TreeNodeStatus {
  treeNodeId: string;
  id?: string;
  status?: string | null;
  color?: string | null;
}
