export class NewMaintenancePlan {
  get wrapper() {
    return cy.get('mnt-maintenance-procedure-create');
  }

  // Form fields
  get intervalUnit() {
    return cy.get('#intervalUnit');
  }

  get intervalUnitOptions() {
    return cy.get('div .ng-option');
  }

  get procedureNameInput() {
    return cy.get('#name');
  }

  get assetTypeDropdown() {
    return cy.get('#assetType');
  }

  get intervalInput() {
    return cy.get('#interval');
  }

  get description() {
    return cy.get('#description');
  }

  get newStepTitle() {
    return cy.get('#title');
  }

  get newStepDescription() {
    return cy.get('.steps-body #description');
  }

  // Buttons
  get cancelButton() {
    return cy.get('.navigation + div a');
  }
  get createButton() {
    return cy.get('.navigation + div button');
  }
  get addStepButton() {
    return cy.get('.steps-header button.btn-outline-dark');
  }
  get addFirstStepButton() {
    return cy.get('.first-step button');
  }
  get addDocument() {
    return cy.get('mnt-procedure-step-document-form button');
  }

  // Add step library
  get stepLibraryClose() {
    return cy.get('mnt-procedure-step-from-library-select > div:nth-child(1) .btn');
  }
  get stepLibraryHeader() {
    return cy.get('mnt-procedure-step-from-library-select > div:nth-child(1) h3');
  }
  get stepLibrary() {
    return cy.get('mnt-procedure-step-from-library-select');
  }

  get createNewStepBtn() {
    return cy.get('.actions button.btn-primary');
  }

  get addSelectedStepsBtn() {
    return cy.get('.actions button.btn-outline-dark');
  }

  get documentAdded() {
    return cy.get('a.document-name');
  }

  get deleteDocumentBtn() {
    return cy.get('.document-list .document-delete');
  }

  get maintenanceStepsHeader() {
    return cy.get('.steps-header h4').eq(0);
  }

  get stepInList() {
    return cy.get('.step-list>div>div')
  }

  get removeStepButton() {
    return cy.get('.steps-header .btn>u');
  }

  get searchInputAddStep() {
    return cy.get('ag-grid-text-search-floating-filter>input');
  }

  get searchResultAddStep() {
    return cy.get('span.ag-cell-value');
  }

  selectAssetType(assetType: string) { 
    this.assetTypeDropdown.click().find('[role="option"]').contains(assetType).click();
  }
}