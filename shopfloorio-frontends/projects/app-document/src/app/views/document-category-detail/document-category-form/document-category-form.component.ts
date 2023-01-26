import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '@sio/common';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { DocumentTypeDto } from 'shared/common/models';

@Component({
  selector: 'app-document-category-form',
  templateUrl: './document-category-form.component.html',
  styleUrls: ['./document-category-form.component.scss'],
})
export class DocumentCategoryFormComponent implements OnInit {
  private destroy$ = new Subject<void>();

  @Input()
  documentType?: DocumentTypeDto;

  @Output()
  valid = new EventEmitter<boolean>();

  form!: FormGroup;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private docService: DocumentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.buildForm();
    this.loading = false;
    this.form.statusChanges
      .pipe(
        takeUntil(this.destroy$),
        map(() => this.form.valid),
        startWith(this.form.valid),
      )
      .subscribe(valid => this.valid.emit(valid));

    if (this.documentType) {
      this.form.patchValue(this.documentType);
    }
  }

  async submit(id?: string) {
    this.loading = true;

    await (id
      ? this.docService.updateDocumentType(id, this.form.value)
      : this.docService.createDocumentType(this.form.value));

    this.loading = false;
    this.router.navigate(['/document-category']);
  }

  private buildForm(): FormGroup {
    return this.fb.group({ name: [null, Validators.required] });
  }
}
