import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService, FileService } from '@sio/common';
import { BehaviorSubject, combineLatest, from, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';
import { DocumentDto, DocumentTypeDto } from 'shared/common/models';

type FileType = 'pdf' | 'image' | 'other';

@Component({
  selector: 'app-document-detail-form',
  templateUrl: './document-detail-form.component.html',
  styleUrls: ['./document-detail-form.component.scss'],
})
export class DocumentDetailFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input()
  document?: DocumentDto;

  @Output()
  valid = new EventEmitter<boolean>();

  form!: FormGroup;
  loading = true;

  fileUrl$ = new BehaviorSubject<string | ArrayBuffer | undefined>(undefined);
  fileType$ = new BehaviorSubject<FileType>('other');
  docTypes$ = from(this.docService.getDocumentTypes());
  pdfViewerSrc$ = new ReplaySubject<{ url: string; withCredentials: true } | ArrayBuffer>(1);
  selectedDocType$!: Observable<DocumentTypeDto | undefined>;

  constructor(
    private fb: FormBuilder,
    private docService: DocumentService,
    private fileService: FileService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.buildForm(typeof this.document?.id === 'string');

    this.docTypes$.pipe(take(1)).subscribe(() => (this.loading = false));

    this.selectedDocType$ = combineLatest([
      this.docTypes$,
      this.form.controls['typeId'].valueChanges.pipe(startWith(this.document?.typeId)),
    ]).pipe(map(([docTypes, typeId]) => docTypes.find(type => type.id === typeId)));

    this.form.statusChanges
      .pipe(
        takeUntil(this.destroy$),
        map(() => this.form.valid),
        startWith(this.form.valid),
      )
      .subscribe(valid => this.valid.emit(valid));

    if (this.document) {
      this.form.patchValue(this.document);
      const fileId = this.document.fileId;
      from(this.fileService.getFileMeta(this.document.fileId))
        .pipe(takeUntil(this.destroy$))
        .subscribe(meta => {
          const type = this.getType(meta.mimeTypeRaw);
          const url = this.fileService.getFileUrl(fileId, true);

          this.fileType$.next(type);
          this.fileUrl$.next(type !== 'other' ? url : undefined);
          if (type === 'pdf') {
            this.pdfViewerSrc$.next({ url, withCredentials: true });
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDocTypeChange(type: DocumentTypeDto): void {
    this.form.patchValue({ typeId: type.id });
  }

  onFileChange(files: File[] | FileList) {
    const file = files[0];
    this.form.patchValue({ file });
    const type = this.getType(file.type);
    this.fileType$.next(type);

    if (type !== 'other') {
      const reader = new FileReader();
      if (type === 'pdf') {
        reader.readAsArrayBuffer(file);
        reader.onload = e => {
          const result = e.target!.result as ArrayBuffer;
          this.fileUrl$.next(result);
          this.pdfViewerSrc$.next(result);
        };
      } else {
        reader.readAsDataURL(file);
        reader.onload = e => this.fileUrl$.next(e.target!.result as ArrayBuffer);
      }
    }
  }

  async submit(id?: string) {
    this.loading = true;
    const { file, ...dto } = this.form.value;

    await (id
      ? this.docService.updateDocument(id, dto, file)
      : this.docService.createDocument(dto, file));

    this.loading = false;
    this.router.navigate(['/documents']);
  }

  private buildForm(isUpdate: boolean): FormGroup {
    return this.fb.group({
      name: [null, Validators.required],
      file: [null, isUpdate ? [] : [Validators.required]],
      typeId: [null, Validators.required],
    });
  }

  private getType(mime: string): FileType {
    if (mime === 'application/pdf') {
      return 'pdf';
    }
    if (mime.startsWith('image/')) {
      return 'image';
    }
    return 'other';
  }
}
