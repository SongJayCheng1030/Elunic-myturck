import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCardLayoutComponent } from './page-card-layout.component';

describe('PageCardLayoutComponent', () => {
  let component: PageCardLayoutComponent;
  let fixture: ComponentFixture<PageCardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageCardLayoutComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageCardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
