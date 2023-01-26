export interface TreeNode<T> {
  id: string;
  value: T;
  parent: TreeNode<T> | null;
  meta: TreeNodeMetadata;
  children: Array<TreeNode<T>>;
  disableReposition?: boolean;
}

export interface TreeNodeMetadata {
  level: number;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}
