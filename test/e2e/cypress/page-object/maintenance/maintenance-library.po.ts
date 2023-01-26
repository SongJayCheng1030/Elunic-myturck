export class MaintenanceLibrary {
  get wrapper() {
    return cy.get('mnt-maintenance-procedures-table');
  }
  get createMaintenance() {
    return cy.get('a[href="#/procedures/new"]');
  }

  get titleColumn() {
    return cy.get('div[name="left"]');
  }

  get nameColumnCell() {
    return cy.get('[col-id="name"]', { timeout: 10000 });
  }

  get centerWrapper() {
    return cy.get('div[name="center"]');
  }

  get loadingLabel() {
    return cy.get('.ag-overlay-loading-center');
  }

  get optionsColumn() {
    return cy.get('.ag-pinned-right-cols-container');
  }

  get editOption() {
    return cy.get('[class="dropdown-menu show"]>button').eq(0);
  }

  get assignOption() {
    return cy.get('[class="dropdown-menu show"]>button').eq(1);
  }

  get deleteOption() {
    return cy.get('[class="dropdown-menu show"]>button').eq(2);
  }

  verifyMaintenanceExist(maintenanceName: string) { 
    this.nameColumnCell.should('contain', maintenanceName);
  }  

  openPlanMenu(planName: string) {
    this.nameColumnCell.contains(planName, { timeout: 10000 }).parent().then(($row) => {
      const rowIndex = $row.attr('row-index')
      this.optionsColumn.find('[row-index=' + rowIndex + ']').find('button[id="grid-actions-dropdown"]').click()
    })
  }

  // Verifies that the plan has the specified number of steps
  expectCountOfSteps(maintenanceName: string, countOfSteps) {
    this.nameColumnCell.contains(maintenanceName, { timeout: 10000 }).parent().then(($row) => {
      const rowIndex = $row.attr('row-index')
      this.centerWrapper.find('[row-index=' + rowIndex + ']').find('[aria-colindex="4"]').should('have.text', countOfSteps)
    })
  }
}