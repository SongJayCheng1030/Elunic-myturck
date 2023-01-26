import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { FileService } from '../../services';

export interface InputConfig {
  type?: string;
  defaultValue?: string | number;
  mode?: 'color' | 'text';
  autoClear?: boolean;
  validateAs?: string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  formControl?: FormControl;
  noValidatorOverwrite?: boolean;
  acceptFilesTypes?: string;
}

@Component({
  selector: 'lib-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnChanges {
  @Input() config: InputConfig = {
    type: 'text',
    defaultValue: '',
    mode: 'text',
    autoClear: false,
    validateAs: 'text',
    maxLength: 100,
    noValidatorOverwrite: false,
  };
  @Input() disabled = false;

  @Output() changeInput = new EventEmitter<string | number>();
  @Output() blurInput = new EventEmitter<string | number>();

  @ViewChild('inputFile', { static: false })
  inputFile!: ElementRef | null;

  input = new FormControl('');
  color = '';
  uploadedFileName = '';

  constructor(
    private fileService: FileService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.config.mode === 'color' && typeof this.config.defaultValue === 'string') {
      this.color = this.config.defaultValue || '#000000';
    }
    if (this.config.formControl) {
      this.input = this.config.formControl;
      this.config.noValidatorOverwrite = true;
    }
    if (this.config.defaultValue) {
      this.input.setValue(this.config.defaultValue);
    }

    if (this.config.type === 'file' && this.config.defaultValue) {
      this.uploadedFileName = this.config.defaultValue.toString();
    }

    this.setValidators();
    this.onChange();
  }

  ngOnChanges() {
    if (this.config.defaultValue) {
      this.input.setValue(this.config.defaultValue);
    }
  }

  onUploadClick($event: any) {
    $event.preventDefault();
    if (this.inputFile) {
      this.inputFile.nativeElement.click();
    }
  }

  onChange() {
    this.input.valueChanges.subscribe((value: string) => {
      this.changeInput.emit(value);
    });
  }

  clearInput() {
    this.uploadedFileName = '';
    this.input.setValue('');
  }

  async handleFileInput(files: File[] | FileList) {
    const file = await this.fileService.uploadFile(files[0]).catch(err => {
      this.toastrService.error(
        this.translateService.instant('MESSAGES.UPLOAD_FAILED'),
        this.translateService.instant('MESSAGES.ERROR'),
      );
    });
    if (file) {
      this.uploadedFileName = file.name;
      this.input.setValue(file.id);
    }
  }

  setValidators() {
    if (this.config.noValidatorOverwrite) return;
    const validators = [];
    if (this.config.required) {
      // @ts-ignore
      validators.push(Validators.required);
    }
    if (this.config.maxLength) {
      // @ts-ignore
      validators.push(Validators.maxLength(this.config.maxLength));
    }
    if (this.config.minLength) {
      // @ts-ignore
      validators.push(Validators.minLength(this.config.minLength));
    }
    if (this.config.mode === 'color') {
      // @ts-ignore
      validators.push(Validators.pattern(/^#[0-9A-F]{6}$/i));
    }
    if (this.config.validateAs === 'url') {
      validators.push(
        // @ts-ignore
        Validators.pattern(
          /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
        ),
      );
    }

    if (this.config.type === 'email') {
      // @ts-ignore
      validators.push(Validators.email);
    }

    this.input.setValidators(validators);
  }
}
