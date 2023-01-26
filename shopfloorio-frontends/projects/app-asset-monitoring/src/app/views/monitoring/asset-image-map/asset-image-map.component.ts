import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EnvironmentService, SidebarService, Size, TreeNode } from '@sio/common';
import { AssetService } from '@sio/common';
import { AssetDto, AssetMapItemDto } from 'shared/common/models';
import { ZoomComponent } from '../../../components/zoom/zoom.component';
import { GREEN, NO_STATUS_COLOR, RED } from './colors.enum';

interface AssetMapItemWithCoordinates extends AssetMapItemDto {
  viewLeft?: number;
  viewTop?: number;
  assetInfo?: AssetDto;
}

@Component({
  selector: 'app-asset-image-map',
  templateUrl: './asset-image-map.component.html',
  styleUrls: ['./asset-image-map.component.scss'],
})
export class AssetImageMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() treeNode!: TreeNode;
  mapUrl!: string;
  size!: Size | null;
  isViewInited = false;
  mapItems?: AssetMapItemWithCoordinates[] = [];
  scale = 1;
  MAX_DETAILS_SCALE = 1.3;
  MIN_DETAILS_SCALE = 0.5;
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  @ViewChild('zoomComponent') zoomComponent!: ZoomComponent;

  imageShift: { top?: number; left?: number } = {};

  get getMapUrl(): string {
    return this.mapUrl ? `url(${this.mapUrl})` : '';
  }
  get getImageWidth(): string {
    return this.size ? `${this.size.width}px` : '';
  }
  get getImageHeight(): string {
    return this.size ? `${this.size.height}px` : '';
  }
  get getScale(): string {
    return this.scale ? `scale(${this.scale})` : '';
  }
  get getDetailsZoom(): string {
    return `scale(${this.getDetailsZoomTransorm})`;
  }
  get getDetailsZoomTransorm(): number {
    if (1 / (this.zoomComponent?.zoom ? this.zoomComponent?.zoom : 1) > this.MAX_DETAILS_SCALE)
      return this.MAX_DETAILS_SCALE;
    if (1 / (this.zoomComponent?.zoom ? this.zoomComponent?.zoom : 1) < this.MIN_DETAILS_SCALE)
      return this.MIN_DETAILS_SCALE;
    return 1 / (this.zoomComponent?.zoom ? this.zoomComponent?.zoom : 1);
  }

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  ngAfterViewInit(): void {
    this.isViewInited = true;
    this.setUrlAndSizeByTreeNode();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.isViewInited) {
      await this.setUrlAndSizeByTreeNode();
      this.setColors();
    }
  }

  setColors(): void {
    // Set gray dots color
    if (this.mapItems) {
      this.mapItems.forEach(v => {
        const randomNumber = Math.round(Math.random() * 10);
        if (randomNumber >= 0 && randomNumber < 3) {
          v.color = RED;
        } else if (randomNumber >= 3 && randomNumber < 6) {
          v.color = GREEN;
        } else v.color = NO_STATUS_COLOR;
      });
    }
  }

  async setUrlAndSizeByTreeNode(): Promise<void> {
    if (this.treeNode?.imageMap?.backgroundImageId) {
      this.mapUrl = this.imageIdToUrl(this.treeNode.imageMap?.backgroundImageId);
      this.size = await this.getImageDimenstion(this.mapUrl);
      const width = this.size?.width ? this.size?.width : 1;
      const height = this.size?.height ? this.size?.height : 1;
      const imageShift: { top?: number; left?: number } = {};
      const scaleWidth =
        Math.floor((this.contentContainer.nativeElement.offsetWidth / width) * 100) / 100;
      const scaleHeight =
        Math.floor((this.contentContainer.nativeElement.offsetHeight / height) * 100) / 100;

      this.scale = Math.min(scaleWidth, scaleHeight);

      const coefficientTop = Math.floor(
        (this.size?.height || 1) / this.contentContainer.nativeElement.offsetHeight,
      );
      const coefficientLeft = Math.floor(
        (this.size?.width || 1) / this.contentContainer.nativeElement.offsetWidth,
      );

      if (coefficientTop > 0) {
        const scaledImageHeight = height * this.scale;
        const scaledImageTopShift = -(height / 2 - scaledImageHeight / 2);

        imageShift.top =
          (this.contentContainer.nativeElement.offsetHeight - scaledImageHeight) / 2 +
          scaledImageTopShift;
      } else {
        imageShift.top = this.contentContainer.nativeElement.offsetHeight / 2 - height / 2;
      }

      if (coefficientLeft > 0) {
        const scaledImageWidth = width * this.scale;
        const scaledImageLeftShift =
          (this.contentContainer.nativeElement.offsetWidth * this.scale) / 2 - scaledImageWidth / 2;

        imageShift.left = scaledImageLeftShift;
      }

      this.imageShift = imageShift;
      this.mapItems = this.treeNode.imageMap.mapItems;
      this.calculateMapItemsPosition(this.scale);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.setUrlAndSizeByTreeNode();
    this.setColors();
  }

  closePopUps(): void {
    if (this.mapItems?.find(v => v.isVisible)) {
      this.mapItems.forEach(v => (v.isVisible = false));
    }
  }

  openAssetLink(mapItem: AssetMapItemWithCoordinates): void {
    if (mapItem?.assetId) {
      this.closePopUps();
      this.sidebarService.emitEvent({ select: { node: { id: mapItem.assetId } } });
    }
  }

  async onAssetClick($event: Event, item: AssetMapItemWithCoordinates): Promise<void> {
    $event.stopPropagation();
    item.isVisible = !item.isVisible;
    if (!item.assetInfo && item.assetId) {
      item.assetInfo = await this.assetService.getAsset(item.assetId);
    }
  }

  getImageDimenstion(imgUrl: string): Promise<Size | null> {
    return new Promise<Size | null>((res, rej) => {
      const img = new Image();
      img.src = imgUrl;
      img.onload = event => {
        const loadedImage: any = event.currentTarget;
        if (loadedImage) {
          const size = new Size(loadedImage.width, loadedImage.height);
          res(size);
        } else {
          rej(null);
        }
      };
      img.onerror = () => rej(null);
    });
  }

  preventInteraction(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  getAssetLink(assetId: string): string {
    return this.environment.assetsManagerFrontendUrl + `#/assets/${assetId}`;
  }

  imageIdToUrlIcon(imageId: string | null): string {
    return `url('${this.environment.fileServiceUrl}v1/image/${imageId}?w=50&h=50&fit=cover')`;
  }

  imageIdToUrl(imageId: string) {
    return `${this.environment.fileServiceUrl}v1/image/${imageId}`;
  }

  scaleCoordinates(x, y, scale) {
    const width =
      (this.size?.width || 1) > this.contentContainer.nativeElement.offsetWidth
        ? this.contentContainer.nativeElement.offsetWidth
        : this.size?.width || 1;
    const height = this.size?.height || 1;

    const centerX = width / 2;
    const centerY = height / 2;
    const relX = x - centerX;
    const relY = y - centerY;
    const scaledX = relX * scale;
    const scaledY = relY * scale;
    let shiftLeft = 0;
    if ((this.size?.width || 1) < this.contentContainer.nativeElement.offsetWidth)
      shiftLeft = this.contentContainer.nativeElement.offsetWidth / 2 - width / 2;

    return { x: shiftLeft + scaledX + centerX, y: scaledY + centerY };
  }

  calculateMapItemsPosition(zoom: number) {
    this.mapItems?.forEach(item => {
      const { x, y } = this.scaleCoordinates(item.left, item.top, zoom);
      item.viewLeft = x;
      item.viewTop = y;
    });
  }
}
