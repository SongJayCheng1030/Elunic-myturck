export class CreateMaintenanceSteps {
  get titleField() {
    return cy.get('mnt-maintenance-procedure-step-form #title');
  }
  get descriptionField() {
    return cy.get('mnt-maintenance-procedure-step-form #description');
  }
  get tagsDropdown() {
    return cy.get('mnt-maintenance-procedure-step-form #tags');
  }
  get stepTypeDropdown() {
    return cy.get('mnt-maintenance-procedure-step-form #stepType');
  }
  get mandatroyCheckbox() {
    return cy.get('lib-checkbox[formcontrolname="mandatory"] .checkbox-label');
  }
  get saveButton() {
    return cy.get('mnt-maintenance-step-library-create button[type="submit"]');
  }
  get clearAllTags() {
    return cy.get('#tags span[title="Clear all"]');
  }

  // Step type fields
  get labelField() {
    return cy.get('#labelText');
  }
  get inputField() {
    return cy.get('#unit');
  }
  get defaultCheckbox() {
    return cy.get('lib-checkbox[formcontrolname="default"] .checkbox-label');
  }

  verifyTagExist(tag: string, isExist: boolean) {
    if (isExist) {
      cy.get('#tags .ng-value-label').contains(tag).should('be.visible');
    } else {
      cy.get('#tags').contains('.ng-value-label', tag).should('not.exist');
    }
  }

  deleteTag(tag: string) {
    cy.get('#tags .ng-value .ng-value-label').contains(tag).siblings('.ng-value-icon').click();
  }
}
