import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryFormComponent } from './document-category-form.component';

describe('DocumentCategoryFormComponent', () => {
  let component: DocumentCategoryFormComponent;
  let fixture: ComponentFixture<DocumentCategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentCategoryFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
