import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-limit-rules-modal',
  templateUrl: './limit-rules-modal.component.html',
  styleUrls: ['./limit-rules-modal.component.scss'],
})
export class LimitRulesModalComponent implements OnInit {
  property?: any;
  form!: FormGroup;
  indicators = [
    {
      key: 'extend',
      label: 'TOOLBAR.BUTTONS.EXTEND',
    },
    {
      key: 'retract',
      label: 'TOOLBAR.BUTTONS.RETRACT',
    },
  ];

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      indicator: [this.property.indicator, Validators.required],
      warningLimitMin: [
        this.property.warningLimitMin,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      warningLimitMax: [
        this.property.warningLimitMax,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      criticalLimitMin: [
        this.property.criticalLimitMin,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      criticalLimitMax: [
        this.property.criticalLimitMax,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
  }

  get indicator() {
    return this.form.get('indicator');
  }

  get warningLimitMin() {
    return this.form.get('warningLimitMin');
  }

  get warningLimitMax() {
    return this.form.get('warningLimitMax');
  }

  get criticalLimitMin() {
    return this.form.get('criticalLimitMin');
  }

  get criticalLimitMax() {
    return this.form.get('criticalLimitMax');
  }

  onCancel(): void {
    this.modal.close(null);
  }

  onSubmit() {
    if (this.form.valid) {
      this.modal.close({ property: this.form.value });
    }
  }
}
