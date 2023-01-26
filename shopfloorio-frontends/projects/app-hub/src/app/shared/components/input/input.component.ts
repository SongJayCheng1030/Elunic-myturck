import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FileService } from '@sio/common';

export interface InputConfig {
  type?: string;
  defaultValue?: string | number;
  mode?: 'color' | 'text';
  autoClear?: boolean;
  validateAs?: string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnChanges {
  @Input() configs: InputConfig = {
    type: 'text',
    defaultValue: '',
    mode: 'text',
    autoClear: false,
    validateAs: 'text',
    maxLength: 100,
  };

  @Output() changeInput = new EventEmitter<string | number>();
  @Output() blurInput = new EventEmitter<string | number>();

  input = new FormControl('');
  color = '';

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    if (this.configs.mode === 'color' && typeof this.configs.defaultValue === 'string') {
      this.color = this.configs.defaultValue || '#000000';
    }
    if (this.configs.defaultValue) {
      this.input.setValue(this.configs.defaultValue);
    }
    this.setValidators();
    this.onChange();
  }

  ngOnChanges() {
    if (this.configs.defaultValue) {
      this.input.setValue(this.configs.defaultValue);
    }
  }

  onChange() {
    this.input.valueChanges.subscribe((value: string) => {
      this.changeInput.emit(value);
    });
  }

  clearInput() {
    this.input.setValue('');
  }

  async handleFileInput(files: File[] | FileList) {
    const file = await this.fileService.uploadFile(files[0]);
    if (file) {
      this.input.setValue(file.id);
    }
  }

  setValidators() {
    const validators = [];
    // @ts-ignore
    if (this.configs.required) validators.push(Validators.required);
    // @ts-ignore
    if (this.configs.maxLength) validators.push(Validators.maxLength(this.configs.maxLength));
    // @ts-ignore
    if (this.configs.minLength) validators.push(Validators.minLength(this.configs.minLength));
    if (this.configs.mode === 'color')
      // @ts-ignore
      validators.push(Validators.pattern(/(^rgb.*\(.*\))|(^#[a-f0-9]{3,8})/i));
    if (this.configs.validateAs === 'url') {
      validators.push(
        // @ts-ignore
        Validators.pattern(
          /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
        ),
      );
    }

    this.input.setValidators(validators);
  }
}
