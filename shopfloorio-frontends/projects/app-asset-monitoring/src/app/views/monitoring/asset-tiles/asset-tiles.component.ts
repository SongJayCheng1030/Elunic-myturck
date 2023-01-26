import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService, SidebarService, TreeNode } from '@sio/common';
import { AssetDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-tiles',
  templateUrl: './asset-tiles.component.html',
  styleUrls: ['./asset-tiles.component.scss'],
})
export class AssetTilesComponent implements OnInit {
  @Input() treeNode!: TreeNode;
  tiles: AssetDto[] = [];

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    if (this.treeNode) {
      this.treeNode.children?.forEach(node => this.tiles.push(node as AssetDto));
    } else if (this.sidebarService.nodes?.length) {
      this.sidebarService.nodes.forEach(node => this.tiles.push(node as AssetDto));
    }
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) {
      return '';
    }
    return `${this.environment.fileServiceUrl}v1/image/${imageId}`;
  }

  onTile(tile: AssetDto) {
    this.sidebarService.emitEvent({ select: { node: { id: tile.id } } });
  }
}
