const { MainteancePage } = require('../../page-object/maintenance/maintenance.po');
const {
  MaintenaceStepLibraryPage,
} = require('../../page-object/maintenance/maintenance-step-library.po');
const {
  CreateMaintenanceSteps,
} = require('../../page-object/maintenance/create-maintenance-step.po');
const { AddImage } = require('../../page-object/maintenance/components/add-image.po');

import { faker } from '@faker-js/faker';
import { qase } from 'cypress-qase-reporter/dist/mocha';

const maintenance = new MainteancePage();
const maintenanceStep = new MaintenaceStepLibraryPage();
const createStep = new CreateMaintenanceSteps();
const image = new AddImage();

describe('Step library - Form details', () => {
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
    maintenanceStep.createStep.click({force: true});
  });

  qase(
    32,
    it('Verify that SAVE CHANGES button while Creating a New Maintenance step is working correctly', () => {
      let title = faker.lorem.word(10);
      let description = faker.lorem.sentence();
      let tag = faker.lorem.words(2);

      createStep.titleField.type(title);
      createStep.descriptionField.type(description);
      createStep.tagsDropdown.click().type(tag);
      cy.addNewTagFromDropdown();
      createStep.saveButton.click({force: true});
      cy.verifyURLContains('/steps-library');
      maintenanceStep.loadingLabel.should('not.exist');
      maintenanceStep.wrapper.should('be.visible');
      cy.verifyStepInTable(title, tag);
    }),
  );

  after(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });
});

describe('Step library - Images section', () => {
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
    maintenanceStep.createStep.click({force: true});
  });

  qase(
    33,
    it('Verify that ADD IMAGE button while Creating a New Maintenance step  is working correctly', () => {
      image.uploadElement.attachFile('stockholm.jpeg');
      cy.wait(2000);
      image.verifyImageIsUploaded('stockholm.jpeg', true);
    }),
  );

  qase(
    34,
    it('Verify that DELETE button in Images Section is working correctly while Creating a New Maintenance step', () => {
      image.deleteImage('stockholm.jpeg');
      cy.wait(1000);
      image.verifyImageIsUploaded('stockholm.jpeg', false);
    }),
  );
});
