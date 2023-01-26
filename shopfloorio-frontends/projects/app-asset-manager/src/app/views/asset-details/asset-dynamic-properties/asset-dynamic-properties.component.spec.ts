import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDynamicPropertiesComponent } from './asset-dynamic-properties.component';

describe('AssetDynamicPropertiesComponent', () => {
  let component: AssetDynamicPropertiesComponent;
  let fixture: ComponentFixture<AssetDynamicPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetDynamicPropertiesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDynamicPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
