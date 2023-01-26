import { ConflictException } from '@nestjs/common';

import { AssetEntity } from '../asset/asset.entity';
import { AssetTreeNodeDto } from './dto/AssetTreeNodeDto';

export interface HierarchyItem {
  id: string;
  parentId: string | null;
}

/**
 * This class is a helper class, which provides useful functions
 * for tree handling. It can build the tree from a hierarchy and
 * asset details and check it, so that it does not contain any
 * loops or undefined nodes
 */
export class AssetHierarchyBuilder {
  private visitedIds: string[] = [];

  constructor(
    private readonly nodes: HierarchyItem[],
    private readonly assets: AssetEntity[],
    private readonly isCheckMode: boolean,
  ) {}

  /**
   * Builds the tree structure and returns it
   */
  run(): AssetTreeNodeDto[] {
    const roots = this.nodes.filter(n => n.parentId === null).map(this.toTreeNode.bind(this));
    const theTree = this.buildTree(roots);

    // Ensure that the tree does not contain isolated areas
    const nodesInTree = AssetHierarchyBuilder.countNodesInTree(theTree);
    if (nodesInTree !== this.nodes.length) {
      throw new ConflictException(`The tree contains loops or isolated node islands.`);
    }

    return theTree;
  }

  /**
   * Internal recursive function to build the tree structure
   *
   * @param currentRoots The current root nodes
   */
  private buildTree(currentRoots: AssetTreeNodeDto[]): AssetTreeNodeDto[] {
    for (const node of currentRoots) {
      // Check if there is a loop and continue
      if (this.visitedIds.indexOf(node.id) > -1) {
        throw new ConflictException(
          `Loop in tree detected: node ${node.id} has already been visited.`,
        );
      }
      this.visitedIds.push(node.id);

      // Find all children ...
      const allChilds = this.nodes.filter(n => n.parentId === node.id);

      // ... and run this function recursively and map
      // the data to the final format
      node.children = this.buildTree((allChilds as unknown) as AssetTreeNodeDto[]).map(
        this.toTreeNode.bind(this),
      );
    }

    return currentRoots;
  }

  /**
   * Transforms the input into an external `AssetTreeNode` dto
   *
   * @param entry Input asset tree node or hierarchy entity
   */
  private toTreeNode(
    entry: AssetTreeNodeDto | (HierarchyItem & { children?: any[] }),
  ): AssetTreeNodeDto {
    if (this.isCheckMode) {
      return {
        id: entry.id,
        children: entry.children || [],
      } as AssetTreeNodeDto;
    }

    const asset = this.assets.find(a => a.id === entry.id);

    if (!asset) {
      throw new ConflictException(`Missing asset information for asset ${entry.id}`);
    }

    return {
      ...AssetEntity.toExternal(asset),
      children: entry.children || [],
    } as AssetTreeNodeDto;
  }

  /**
   * Tree helper function to get the ids of all nodes inside
   * the tree
   *
   * @param roots List of root nodes
   */
  static getAllNodeIds(roots: AssetTreeNodeDto[]): string[] {
    if (!Array.isArray(roots)) {
      return [];
    }

    let listOfIds = roots.map(r => r.id);
    for (const root of roots) {
      listOfIds = listOfIds.concat(AssetHierarchyBuilder.getAllNodeIds(root.children));
    }
    return listOfIds;
  }

  /**
   * Tree helper function to count the nodes inside a
   * tree structure
   *
   * @param roots List of root nodes
   */
  static countNodesInTree(roots: AssetTreeNodeDto[]): number {
    if (!Array.isArray(roots)) {
      return 0;
    }

    let count = roots.length;
    for (const root of roots) {
      count += AssetHierarchyBuilder.countNodesInTree(root.children);
    }
    return count;
  }

  /**
   * Builds a tree from a hierarchy list and detailed asset
   * information
   *
   * @param nodes List of the hierarchy
   * @param assets Detailed asset information
   */
  static build(nodes: HierarchyItem[], assets: AssetEntity[]) {
    const builder = new AssetHierarchyBuilder(nodes, assets, false);
    return builder.run();
  }

  /**
   * Checks the tree defined by the hierarchy so that
   * it does not contain loops or islands
   *
   * @param nodes List of the hierarchy
   */
  static check(nodes: HierarchyItem[]) {
    const builder = new AssetHierarchyBuilder(nodes, [], true);
    return builder.run();
  }
}
