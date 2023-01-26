import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EnvironmentService, FileService } from '@sio/common';
import { BehaviorSubject, catchError, finalize, forkJoin, from, map, of, skip } from 'rxjs';
import { FileData, FileMetaResponse } from 'shared/common/models';
import { ViewChild } from '@angular/core';

const PROCEDURE_STEP_IMAGES_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntProcedureStepImagesFormComponent),
  multi: true,
};

interface MntImageDetails {
  id: string;
  name: string;
  src: string;
}

@UntilDestroy()
@Component({
  selector: 'mnt-procedure-step-images-form',
  templateUrl: './procedure-step-images-form.component.html',
  styleUrls: ['./procedure-step-images-form.component.scss'],
  providers: [PROCEDURE_STEP_IMAGES_CONTROL_ACCESSOR],
})
export class MntProcedureStepImagesFormComponent implements ControlValueAccessor {
  @Input() isEdit = false;

  @ViewChild('fileInput')
  fileInputVariable!: ElementRef;

  images$ = new BehaviorSubject<MntImageDetails[]>([]);

  isDisabled = false;

  uploadedImageIds = new Set<string>();

  onTouched: () => void = () => {};

  constructor(private fileService: FileService, private environment: EnvironmentService) {}

  writeValue(imageIds: string[]): void {
    if (imageIds?.length) {
      forkJoin(imageIds.map(id => this.fileService.getFileMeta(id))).subscribe({
        next: images => this.images$.next(images.map(image => this.transformFileMetadata(image))),
      });
    }
  }

  registerOnChange(fn: () => void): void {
    this.images$
      .pipe(
        map(images => images.map(({ id }) => id)),
        untilDestroyed(this),
      )
      .subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onAddImages(images: FileList) {
    const onlyImages: File[] = [];
    if (images.length) {
      Object.values(images).map((image: File) => {
        const pattern = /image-*/;
        if (image.type.match(pattern)) {
          onlyImages.push(image);
        }
      });
    }

    if (onlyImages.length) {
      forkJoin(onlyImages.map(file => this.fileService.uploadFile(file))).subscribe({
        next: files => {
          this.addFiles(files);
          this.reset();
        },
      });
    }
  }

  reset() {
    this.fileInputVariable.nativeElement.value = '';
  }

  onSortImages({ previousIndex, currentIndex }: CdkDragDrop<MntImageDetails>) {
    const images = this.images$.value;
    const [movedImage] = images.splice(previousIndex, 1);
    images.splice(currentIndex, 0, movedImage);
    this.images$.next(images);
  }

  onDeleteImage(index: number): void {
    const images = this.images$.value;
    const [{ id: imageId }] = images.splice(index, 1);
    const action$ =
      // we must not delete images from the file service
      // they are needed for archived maintenance steps
      this.isEdit && !this.uploadedImageIds.has(imageId)
        ? of(null)
        : from(this.fileService.deleteFile(imageId)).pipe(
            catchError(() => {
              // we swallow an error from the file service if an image can't be deleted
              // the refernce will be removed anyway
              console.log(`Error deleting file with ID: ${imageId}`);
              return of(null);
            }),
            finalize(() => this.uploadedImageIds.delete(imageId)),
          );
    action$.subscribe({ next: () => this.images$.next(images) });
  }

  trackBy(index: number, image: MntImageDetails): string {
    return image.id;
  }

  private addFiles(imageDetails: FileData[]) {
    const currentImageIds = this.images$.value;
    imageDetails.map(({ id }) => id).forEach(id => this.uploadedImageIds.add(id));
    this.images$.next([
      ...currentImageIds,
      ...imageDetails.map(imageData => this.transformFileMetadata(imageData)),
    ]);
  }

  private transformFileMetadata({ id, name }: FileMetaResponse | FileData): MntImageDetails {
    return { id, name, src: `${this.environment.fileServiceUrl}v1/image/${id}` };
  }
}
