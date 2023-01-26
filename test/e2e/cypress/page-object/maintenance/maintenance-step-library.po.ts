const data = require('../../fixtures/i18n/en.json');

export class MaintenaceStepLibraryPage {
  get wrapper() {
    return cy.get('mnt-maintenance-procedure-step-library mnt-maintenance-step-library-table', { timeout: 10000 });
  }
  get newStepWrapper() {
    return cy.get('mnt-maintenance-step-library-create > mnt-maintenance-step-library-form');
  }

  // Buttons
  get createStep() {
    return cy.get('.actions a[href="#/steps-library/new"]');
  }
  get cancelButton() {
    return cy.get('.header-actions a');
  }
  get saveButton() {
    return cy.get('.header-actions button');
  }
  get confirmCancel() {
    return cy.get('.btn-abort');
  }

  get addDocumentButton() {
    return cy.get('mnt-maintenance-procedure-step-form mnt-procedure-step-document-form button');
  }

  get documentAdded() {
    return cy.get('a.document-name');
  }

  get dropdownMenu() {
    return cy.get('[class="dropdown-menu show"]');
  }

  get searchInput() {
    return cy.get('ag-grid-text-search-floating-filter>input');
  }

  get searchResultsTitle() {
    return cy.get('.ag-center-cols-viewport>div>div>[col-id="name"]');
  }

  get stepNameCell() {
    return cy.get('div[ref="centerContainer"] div[col-id="name"]');
  }

  get optionsColumn() {
    return cy.get('.ag-pinned-right-cols-container');
  }

  get editOption() {
    return cy.get('[class="dropdown-menu show"]>button').eq(0);
  }

  get deleteOption() {
    return cy.get('[class="dropdown-menu show"]>button').contains(data.button.delete);
  }

  get loadingLabel() {
    return cy.get('.ag-overlay-loading-center');
  }

  openStepMenu(stepName: string) {
    this.stepNameCell.contains(stepName, { timeout: 10000 }).parent().then(($row) => {
      const rowId = $row.attr('row-id')
      this.optionsColumn.find('[row-id=' + rowId + ']').click()
    });
  }
}
