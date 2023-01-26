import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryHistoryComponent } from './document-category-history.component';

describe('DocumentCategoryHistoryComponent', () => {
  let component: DocumentCategoryHistoryComponent;
  let fixture: ComponentFixture<DocumentCategoryHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentCategoryHistoryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCategoryHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
