import { qase } from 'cypress-qase-reporter/dist/mocha';
const data = require('../../fixtures/i18n/en.json'); // I will redo this in separated branch
const { MainteancePage } = require('../../page-object/maintenance/maintenance.po');
const {
  MaintenaceStepLibraryPage,
} = require('../../page-object/maintenance/maintenance-step-library.po');
const {
  CreateMaintenanceSteps,
} = require('../../page-object/maintenance/create-maintenance-step.po');

import { faker } from '@faker-js/faker';

const maintenance = new MainteancePage();
const maintenanceStep = new MaintenaceStepLibraryPage();
const createStep = new CreateMaintenanceSteps();

describe('Step library - Form details', () => {
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
    maintenanceStep.createStep.click();
  });

  qase(
    24,
    it('Verify that Input Fields in Create New Maintenance step page are working correctly', () => {
      let title = faker.lorem.word();
      let description = faker.lorem.sentence();

      createStep.titleField.type(title);
      createStep.descriptionField.type(description);

      createStep.titleField.invoke('val').then(val => {
        expect(val).to.contain(title);
      });

      createStep.descriptionField.invoke('val').then(val => {
        expect(val).to.contain(description);
      });
    }),
  );

  qase(
    27,
    it('Verify that Step type dropdown in Create New Maintenance step is working correctly', () => {
      // Check free text field
      createStep.stepTypeDropdown.click();
      cy.selectOptionFromDropdown(data.stepLibrary.stepType.freeText);
      createStep.labelField.should('be.visible');
      createStep.inputField.should('not.exist');

      // Check description field
      createStep.stepTypeDropdown.click();
      cy.selectOptionFromDropdown(data.stepLibrary.stepType.description);
      createStep.labelField.should('not.exist');
      createStep.inputField.should('not.exist');

      // Check description field
      createStep.stepTypeDropdown.click();
      cy.selectOptionFromDropdown(data.stepLibrary.stepType.numerical);
      createStep.labelField.should('be.visible');
      createStep.inputField.should('be.visible');

      // Check description field
      createStep.stepTypeDropdown.click();
      cy.selectOptionFromDropdown(data.stepLibrary.stepType.checkbox);
      createStep.labelField.should('be.visible');
      createStep.defaultCheckbox.should('be.visible');
    }),
  );

  qase(
    83,
    it('Verify that add new tag dropdown in Create New Maintenance step is working correctly', () => {
      let newTag = faker.lorem.word();
      createStep.tagsDropdown.click().type(newTag);
      cy.addNewTagFromDropdown();
      createStep.verifyTagExist(newTag, true);
    }),
  );

  qase(
    84,
    it('Verify that  "delete tag" in Create New Maintenance step is working correctly', () => {
      {
        let newTag = faker.lorem.word();
        createStep.tagsDropdown.click().type(newTag);
        cy.addNewTagFromDropdown();
        createStep.verifyTagExist(newTag, true);
        cy.wait(2000);
        createStep.deleteTag(newTag);
        createStep.verifyTagExist(newTag, false);
      }
    }),
  );

  qase(
    85,
    it('Verify that  "delete all tags" in Create New Maintenance step is working correctly', () => {
      {
        let tag1 = '1' + faker.lorem.word();
        let tag2 = '2' + faker.lorem.word();
        createStep.tagsDropdown.click().type(tag1);
        cy.addNewTagFromDropdown();
        createStep.tagsDropdown.click().type(tag2);
        cy.addNewTagFromDropdown();
        createStep.verifyTagExist(tag1, true);
        createStep.verifyTagExist(tag2, true);
        // Create tags and verify they do not exist
        createStep.clearAllTags.click();
        createStep.verifyTagExist(tag1, false);
        createStep.verifyTagExist(tag2, false);
      }
    }),
  );
});
