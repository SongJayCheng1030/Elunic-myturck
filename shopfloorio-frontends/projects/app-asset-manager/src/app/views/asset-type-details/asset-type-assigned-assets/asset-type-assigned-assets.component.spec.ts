import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTypeAssignedAssetsComponent } from './asset-type-assigned-assets.component';

describe('AssetTypeAssignedAssetsComponent', () => {
  let component: AssetTypeAssignedAssetsComponent;
  let fixture: ComponentFixture<AssetTypeAssignedAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetTypeAssignedAssetsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetTypeAssignedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
