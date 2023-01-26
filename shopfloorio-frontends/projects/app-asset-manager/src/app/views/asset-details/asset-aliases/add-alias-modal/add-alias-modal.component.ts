import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetAliasType } from 'shared/common/models';

interface AliasType {
  title: string;
  type: AssetAliasType;
}

@Component({
  selector: 'app-add-alias-modal',
  templateUrl: './add-alias-modal.component.html',
  styleUrls: ['./add-alias-modal.component.scss'],
})
export class AddAliasModalComponent implements OnInit {
  form!: FormGroup;
  aliasTypes: AliasType[] = [
    {
      title: 'VIEWS.ASSET_ALIAS_TYPES.GENERAL',
      type: AssetAliasType.GENERAL,
    },
    {
      title: 'VIEWS.ASSET_ALIAS_TYPES.QR_CODE',
      type: AssetAliasType.QR_CODE,
    },
  ];

  constructor(private readonly fb: FormBuilder, private readonly modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.form = this.buildForm();
  }

  onSubmit(): void {
    this.modal.close({
      ...this.form.value,
      createdAt: new Date().toISOString(),
    });
  }

  onCancel(): void {
    this.modal.close(null);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      alias: [null, Validators.required],
      type: [null, Validators.required],
      description: [null],
    });
  }
}
