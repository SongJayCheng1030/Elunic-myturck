import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryDetailComponent } from './document-category-detail.component';

describe('DocumentCategoryDetailComponent', () => {
  let component: DocumentCategoryDetailComponent;
  let fixture: ComponentFixture<DocumentCategoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentCategoryDetailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCategoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
