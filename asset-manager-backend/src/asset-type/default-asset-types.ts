import { ISA95EquipmentHierarchyModelElement, MultilangValue } from 'shared/common/models';

export interface DefaultAssetType {
  uid: number;
  equipmentType: ISA95EquipmentHierarchyModelElement;
  name: MultilangValue;
  extendsType?: number;
  description?: string;
}

export function getDefaultAssetTypes(): DefaultAssetType[] {
  return [
    {
      uid: 100,
      equipmentType: ISA95EquipmentHierarchyModelElement.NONE,
      name: {
        de_DE: 'Allgemein',
        en_EN: 'Generic',
      },
    },
    {
      uid: 101,
      equipmentType: ISA95EquipmentHierarchyModelElement.ENTERPRISE,
      name: {
        de_DE: 'Unternehmen',
        en_EN: 'Enterprise',
      },
    },
    {
      uid: 102,
      equipmentType: ISA95EquipmentHierarchyModelElement.SITE,
      name: {
        de_DE: 'Standort',
        en_EN: 'Site',
      },
    },
    {
      uid: 103,
      equipmentType: ISA95EquipmentHierarchyModelElement.AREA,
      name: {
        de_DE: 'Anlagenkomplex',
        en_EN: 'Area',
      },
    },

    {
      uid: 104,
      equipmentType: ISA95EquipmentHierarchyModelElement.WORK_CENTER,
      name: {
        de_DE: 'Bearbeitungszentrum',
        en_EN: 'Work center',
      },
    },
    {
      uid: 140,
      equipmentType: ISA95EquipmentHierarchyModelElement.PROCESS_CELL,
      name: {
        de_DE: 'Prozesszelle (Bearbeitungszentrum)',
        en_EN: 'Process cell (Work Center)',
      },
      extendsType: 104,
    },
    {
      uid: 141,
      equipmentType: ISA95EquipmentHierarchyModelElement.PRODUCTION_UNIT,
      name: {
        de_DE: 'Produktionseinheit (Bearbeitungszentrum)',
        en_EN: 'Production unit (Work Center)',
      },
      extendsType: 104,
    },
    {
      uid: 142,
      equipmentType: ISA95EquipmentHierarchyModelElement.PRODUCTION_LINE,
      name: {
        de_DE: 'Fertigungsstraße (Bearbeitungszentrum)',
        en_EN: 'Production line (Work Center)',
      },
      extendsType: 104,
    },
    {
      uid: 143,
      equipmentType: ISA95EquipmentHierarchyModelElement.STORAGE_ZONE,
      name: {
        de_DE: 'Lagerbereich (Bearbeitungszentrum)',
        en_EN: 'Storage zone (Work Center)',
      },
      extendsType: 104,
    },

    {
      uid: 105,
      equipmentType: ISA95EquipmentHierarchyModelElement.WORK_UNIT,
      name: {
        de_DE: 'Arbeitseinheit',
        en_EN: 'Work unit',
      },
    },
    {
      uid: 150,
      equipmentType: ISA95EquipmentHierarchyModelElement.STORAGE_UNIT,
      name: {
        de_DE: 'Lagereinheit (Arbeitseinheit)',
        en_EN: 'Storage unit (Work unit)',
      },
      extendsType: 105,
    },
    {
      uid: 151,
      equipmentType: ISA95EquipmentHierarchyModelElement.EQUIPMENT_MODULE,
      name: {
        de_DE: 'Maschinenmodul (Arbeitseinheit)',
        en_EN: 'Equipment module (Work unit)',
      },
      extendsType: 105,
    },
    {
      uid: 152,
      equipmentType: ISA95EquipmentHierarchyModelElement.CONTROL_MODULE,
      name: {
        de_DE: 'Kontrollmodul (Arbeitseinheit)',
        en_EN: 'Control module (Work unit)',
      },
      extendsType: 105,
    },
    {
      uid: 153,
      equipmentType: ISA95EquipmentHierarchyModelElement.UNIT,
      name: {
        de_DE: 'Einheit (Arbeitseinheit)',
        en_EN: 'Unit (Work unit)',
      },
      extendsType: 105,
    },
  ];
}
