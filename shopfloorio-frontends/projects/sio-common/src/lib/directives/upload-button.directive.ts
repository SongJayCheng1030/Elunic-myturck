import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { FileData } from 'shared/common/models';

import { FileService } from '../services/file.service';

@Directive({
  selector: '[uploadButton]',
})
export class UploadButtonDirective implements OnInit, OnDestroy {
  private loading = false;
  private input!: HTMLInputElement;
  private inputChangeListener!: Function;

  // file_extension|audio/*|video/*|image/*|media_type
  @Input()
  acceptFileTypes?: string[] = [];

  @Output()
  uploaded = new EventEmitter<FileData>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private fileService: FileService,
  ) {}

  ngOnInit(): void {
    this.input = this.renderer.createElement('input');
    this.renderer.setAttribute(this.input, 'type', 'file');
    if (this.acceptFileTypes && this.acceptFileTypes?.length > 0) {
      this.renderer.setAttribute(this.input, 'accept', this.acceptFileTypes.join(','));
    }
    this.renderer.addClass(this.input, 'd-none');
    this.renderer.appendChild(this.el.nativeElement, this.input);

    this.inputChangeListener = this.renderer.listen(this.input, 'change', () => {
      this.onUploadFile();
    });
  }

  @HostListener('click')
  onClick(): void {
    if (!this.loading) {
      this.input.click();
    }
  }

  ngOnDestroy(): void {
    this.inputChangeListener();
    this.renderer.removeChild(this.el.nativeElement, this.input);
  }

  async onUploadFile(): Promise<void> {
    const files = this.input.files;

    if (files?.length) {
      this.setLoading(true);

      try {
        const res = await this.fileService.uploadFile(files.item(0) as File);

        if (res) {
          this.uploaded.emit(res);
        }
      } finally {
        this.input.value = '';
        this.setLoading(false);
      }
    }
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;

    loading
      ? this.renderer.addClass(this.el.nativeElement, 'loading')
      : this.renderer.removeClass(this.el.nativeElement, 'loading');
  }
}
