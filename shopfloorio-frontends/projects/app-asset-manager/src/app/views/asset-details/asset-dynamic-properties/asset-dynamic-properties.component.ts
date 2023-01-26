import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AssetService } from '@sio/common';
import { UnitedPropertyDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-dynamic-properties',
  templateUrl: './asset-dynamic-properties.component.html',
  styleUrls: ['./asset-dynamic-properties.component.scss'],
})
export class AssetDynamicPropertiesComponent implements OnInit, OnChanges {
  @Input() assetId!: string | null;
  @Input() assetTypeId!: string;

  properties: UnitedPropertyDto[] = [];
  changedProperties: Array<{
    value?: string | number | boolean | Date | null;
    position: number | null;
    id: string;
  }> = [];

  inputControl = new FormControl('');

  editMode = {
    enable: false,
    propertyId: '',
  };
  loading = false;

  @Output() setChangedProperties = new EventEmitter();
  @Output() triggerEditing = new EventEmitter();

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
    this.getDynamicProperties();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.assetTypeId.currentValue) {
      this.properties = await this.assetService.getAssetTypeProperties(
        changes.assetTypeId.currentValue,
      );
    }
  }

  async getDynamicProperties() {
    if (!this.assetId) return;

    this.loading = true;
    const properties = await this.assetService.getAssetProperties(this.assetId);
    this.properties = properties
      ? properties.sort((a, b) => (a.position || 0) - (b.position || 0))
      : [];

    this.loading = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async changePosition(event: CdkDragDrop<any, UnitedPropertyDto>) {
    if (!this.assetId) return;

    const { currentIndex, previousIndex } = event;
    const prevItem = this.properties.find((property, i) => i === event.previousIndex);
    const currItem = this.properties.find((property, i) => i === event.currentIndex);

    if (!currItem || !prevItem) return;

    const propertiesCache = [...this.properties];
    propertiesCache[currentIndex] = { ...prevItem };
    propertiesCache[previousIndex] = { ...currItem };

    this.properties = propertiesCache;

    this.setItemToUpdateArray({
      ...prevItem,
      position: currItem.position,
    });

    this.setItemToUpdateArray({
      ...currItem,
      position: prevItem.position,
    });

    this.triggerEditing.emit();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setInputPropertyFocus(event: any, property: UnitedPropertyDto) {
    event.target.value = property.value || '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeInputProperty(event: any, property: UnitedPropertyDto) {
    this.setItemToUpdateArray({
      ...property,
      value: event.target.value || property.value,
    });

    this.triggerEditing.emit();
  }

  setItemToUpdateArray(property: Partial<UnitedPropertyDto>) {
    if (!property.id) return;

    const isPropertyWasChanged = this.changedProperties.find(item => item.id === property.id);

    if (!isPropertyWasChanged) {
      this.changedProperties.push({
        value: property.value,
        position: property.position || 0,
        id: property.id,
      });
    } else {
      isPropertyWasChanged.position = property.position || 0;
      isPropertyWasChanged.value = property.value;
    }

    this.setChangedProperties.emit(this.changedProperties);
  }

  switchPropertyToReadOnlyMode() {
    this.editMode.enable = false;
  }

  switchPropertyToEditMode(propertyId: string) {
    this.editMode = {
      enable: true,
      propertyId,
    };
  }

  switchToEditModeAndFocus(propertyId: string, input: HTMLInputElement) {
    this.switchPropertyToEditMode(propertyId);
    input.disabled = false;
    input.focus();
  }

  async resetData() {
    this.getDynamicProperties();
    this.changedProperties = [];
  }
}
