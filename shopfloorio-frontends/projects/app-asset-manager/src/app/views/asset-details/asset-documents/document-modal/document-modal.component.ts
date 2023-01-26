import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentDto, FileResponse } from 'shared/common/models';

@Component({
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.scss'],
})
export class DocumentModalComponent implements OnInit {
  form!: FormGroup;
  document!: DocumentDto;
  mode: 'new' | 'edit' = 'new';

  get documentId(): AbstractControl {
    return this.form.get('documentId') as AbstractControl;
  }

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.form = this.buildForm();

    if (this.document) {
      this.form.patchValue(this.document);
    }
  }

  onUploadDocument(file: FileResponse): void {
    this.documentId.setValue(file.id);
  }

  onSubmit(): void {
    this.modal.close(this.form.value);
  }

  onCancel(): void {
    this.modal.close(null);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      documentId: [null, Validators.required],
      documentType: [null, Validators.required],
      description: [null, Validators.required],
    });
  }
}
