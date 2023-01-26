import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLinkedAssetsComponent } from './document-linked-assets.component';

describe('DocumentLinkedAssetsComponent', () => {
  let component: DocumentLinkedAssetsComponent;
  let fixture: ComponentFixture<DocumentLinkedAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentLinkedAssetsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLinkedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
