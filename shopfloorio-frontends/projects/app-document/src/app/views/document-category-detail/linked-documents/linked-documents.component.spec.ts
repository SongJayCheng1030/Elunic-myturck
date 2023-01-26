import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedDocumentsComponent } from './linked-documents.component';

describe('LinkedDocumentsComponent', () => {
  let component: LinkedDocumentsComponent;
  let fixture: ComponentFixture<LinkedDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkedDocumentsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
