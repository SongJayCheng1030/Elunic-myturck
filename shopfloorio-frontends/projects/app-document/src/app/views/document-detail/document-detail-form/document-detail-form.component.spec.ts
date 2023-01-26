import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDetailFormComponent } from './document-detail-form.component';

describe('DocumentDetailFormComponent', () => {
  let component: DocumentDetailFormComponent;
  let fixture: ComponentFixture<DocumentDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentDetailFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
