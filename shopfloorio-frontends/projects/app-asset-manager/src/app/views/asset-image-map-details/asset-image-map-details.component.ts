import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AssetService,
  EnvironmentService,
  ModalConfirmComponent,
  ModalMessageComponent,
  Size,
  TreeNode,
} from '@sio/common';
import {
  AssetDto,
  AssetImageMapDto,
  AssetMapItemDto,
  AssetTreeNodeDto,
} from 'shared/common/models';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-asset-image-map-details',
  templateUrl: './asset-image-map-details.component.html',
  styleUrls: ['./asset-image-map-details.component.scss'],
})
export class AssetImageMapDetailsComponent implements OnInit {
  assetImageMap = {} as AssetImageMapDto;
  form!: FormGroup;
  editMode = false;
  isDragOver = false;
  size!: Size | null;
  loading = false;
  clone!: HTMLElement;
  elementRadius = 50;
  assetTree: AssetTreeNodeDto[] = [];
  assets: AssetDto[] = [];
  activeDragElementId = '';
  mapItems: AssetMapItemDto[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listener!: (e: any) => void;
  maxImageMapEditWindowSize!: Size | null;
  minAssetBlockWidth = 320;
  scale = 1;
  acceptFileTypes = ['.jpg', '.png'];

  @ViewChild('photoCanvas', { static: false })
  photoCanvas!: ElementRef;

  get imageId(): AbstractControl {
    return this.form.get('imageId') as AbstractControl;
  }
  get selectedParentAssetsControl(): AbstractControl {
    return this.form.get('selectedParentAssets') as AbstractControl;
  }
  get getImageWidth(): string {
    return this.size ? `${this.size.width}px` : '';
  }
  get getImageHeight(): string {
    return this.size ? `${this.size.height}px` : '';
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  @HostListener('window:resize', ['$event.target'])
  onResize(): void {
    this.setPhotoMaxSize();
    this.changePhotoSize(this.imageId.value);

    // update cord
    this.updateImageItemsCord();
  }

  setPhotoMaxSize() {
    if (this.photoCanvas?.nativeElement) {
      const elmWidth = this.photoCanvas.nativeElement.parentElement.offsetWidth;
      const width = this.assetTree?.length ? elmWidth - this.minAssetBlockWidth : elmWidth;
      this.maxImageMapEditWindowSize = new Size(
        width,
        this.photoCanvas.nativeElement.parentElement.offsetHeight,
      );
    }
  }

  async ngOnInit(): Promise<void> {
    this.form = this.buildForm();
    this.assetTree = await this.assetService.getAssetTree();
    this.assets = await this.assetService.getAll();
    if (this.route.snapshot.data.assetImageMap) {
      this.editMode = true;
      this.assetImageMap = this.route.snapshot.data.assetImageMap;
      this.selectedParentAssetsControl.setValue(
        this.assets.filter(e => e.imageMap && e.imageMap.id === this.assetImageMap.id),
      );
      if (this.assetImageMap.backgroundImageId) {
        await this.onUploadThumbnail({ id: this.assetImageMap.backgroundImageId });
        this.updateImageItemsCord();
      }
    }
  }

  updateImageItemsCord(): void {
    this.mapItems = this.assetImageMap.mapItems
      ? this.assetImageMap.mapItems.map(v => {
          v.top = v.top * this.scale;
          v.left = v.left * this.scale;
          return v;
        })
      : [];
  }

  onDragEnd(e: DragEvent): void {
    const elem = document.getElementById(this.activeDragElementId);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    elem!.style.opacity = '1';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const draggableAsset = this.mapItems.find(v => v.id === this.activeDragElementId)!;
    const left = draggableAsset.left + (e.offsetX - this.elementRadius) / this.scale;
    const top = draggableAsset.top + (e.offsetY - this.elementRadius) / this.scale;
    this.moveAt(draggableAsset, left, top);
    document.body.removeChild(this.clone);
    window.removeEventListener('drag', this.listener);
  }

  onDragStart(e: DragEvent, id: string): void {
    this.activeDragElementId = id;
    const elem = document.getElementById(id);
    if (elem) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      elem!.style.opacity = '0';
      this.clone = elem?.cloneNode(true) as HTMLElement;
      // clear data after clone
      this.clone.style.visibility = 'hidden';
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.elementRadius = elem!.clientWidth / 2;
      this.clone.style.opacity = '1';
      document.body.appendChild(this.clone);
      this.listener = event => this.moveCursor(event);
      window.addEventListener('drag', this.listener);
    }
  }

  moveCursor = (e: MouseEvent) => {
    this.clone.style.visibility = 'visible';
    this.clone.style.left = `${e.pageX - this.elementRadius}px`;
    this.clone.style.top = `${e.pageY - this.elementRadius}px`;
  };

  moveAt(draggableAsset: AssetMapItemDto, shiftX: number, shiftY: number) {
    draggableAsset.left = shiftX;
    draggableAsset.top = shiftY;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      imageId: [null],
      selectedParentAssets: [null],
    });
  }

  deleteImage() {
    this.form.get('imageId')?.setValue(null);
  }

  onUploadThumbnail(file: { id: string }): void {
    this.imageId.setValue(file.id);
    this.setPhotoMaxSize();
    this.changePhotoSize(file.id);
  }

  async changePhotoSize(id: string) {
    const originalPhotoSize = await this.getImageDimenstion(this.imageIdToUrl(id));
    if (originalPhotoSize && this.maxImageMapEditWindowSize) {
      this.scale = this.maxImageMapEditWindowSize.width / originalPhotoSize.width;
      const width = originalPhotoSize.width * this.scale;
      const height = originalPhotoSize.height * this.scale;
      this.size = new Size(width, height);
    }
  }

  onItemMapRemove(itemMap: AssetMapItemDto): void {
    const index = this.mapItems.findIndex(v => v.id === itemMap.id);
    if (index >= 0) {
      this.mapItems = this.mapItems.filter((v, i) => i !== index);
    }
  }

  onTreeNodeSelect(node: TreeNode): void {
    this.mapItems.push({
      id: 'temp-' + uuid() + node.id,
      left: 0,
      top: 0,
      assetId: node.id,
      imageId: node.imageId,
    });
  }

  async onSave(): Promise<void> {
    const positions = this.mapItems.map(object => ({ ...object })) as Array<
      Partial<AssetMapItemDto>
    >;
    try {
      if (this.editMode) {
        await this.assetService.updateAssetMap({
          backgroundImageId: this.form.value.imageId,
          mapItems: positions.map(v => {
            if (v.id?.includes('temp-')) {
              delete v.id;
              return { ...v };
            } else {
              return { ...v };
            }
          }) as AssetMapItemDto[],
          id: this.assetImageMap.id,
        });
        if (this.selectedParentAssetsControl.value) {
          const selectedAssets: AssetDto[] = this.selectedParentAssetsControl.value;
          const deselectedAssets: AssetDto[] = this.assets
            .filter(x => !selectedAssets.includes(x))
            .concat(selectedAssets.filter(x => !this.assets.includes(x)));
          for (const asset of selectedAssets) {
            await this.assetService.setAssetMapToAsset({
              assetId: asset.id,
              imageMapId: this.assetImageMap.id,
            });
          }
          for (const asset of deselectedAssets) {
            if (asset.imageMap?.id === this.assetImageMap.id) {
              // deselect image map from current asset
              await this.assetService.setAssetMapToAsset({ assetId: asset.id, imageMapId: null });
            }
          }
        }
      } else {
        const res = await this.assetService.createAssetMap({
          backgroundImageId: this.form.value.imageId,
          mapItems: positions.map(v => {
            delete v.id;
            return { ...v };
          }) as AssetMapItemDto[],
        });
        if (this.selectedParentAssetsControl.value) {
          const selectedAssets: AssetDto[] = this.selectedParentAssetsControl.value;
          for (const asset of selectedAssets) {
            await this.assetService.setAssetMapToAsset({ assetId: asset.id, imageMapId: res.id });
          }
        }
      }
      this.router.navigate(['/asset-maps']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      const modal = this.modalService.open(ModalMessageComponent, { centered: true });

      modal.componentInstance.content = {
        title: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.TITLE',
        body: ex.error?.message || 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.BODY',
        dismiss: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.DISMISS',
      };
    }
  }

  async onDelete(): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.assetService.deleteAssetMap(this.assetImageMap.id!);
        this.router.navigate(['/asset-maps']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });

        modal.componentInstance.content = {
          title: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.TITLE',
          body: ex.message || 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.BODY',
          dismiss: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.DISMISS',
        };
      }
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.ABORT',
    };
    return modal.result;
  }

  imageIdToUrl(imageId: string): string {
    return `${this.environment.fileServiceUrl}v1/image/${imageId}`;
  }

  imageIdToBackground(imageId: string | null): string {
    return `url('${this.environment.fileServiceUrl}v1/image/${imageId}')`;
  }

  imageIdToUrlIcon(imageId: string | null): string {
    return `url('${this.environment.fileServiceUrl}v1/image/${imageId}?w=${
      this.elementRadius * 2
    }&h=${this.elementRadius * 2}&fit=cover')`;
  }

  preventInteraction(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  getImageDimenstion(imgUrl: string): Promise<Size | null> {
    return new Promise<Size | null>((res, rej) => {
      const img = new Image();
      img.src = imgUrl;
      img.onload = event => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}
