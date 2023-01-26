import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppsNavMenuComponent } from './apps-nav-menu.component';

describe('AppsNavMenuComponent', () => {
  let component: AppsNavMenuComponent;
  let fixture: ComponentFixture<AppsNavMenuComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppsNavMenuComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppsNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
