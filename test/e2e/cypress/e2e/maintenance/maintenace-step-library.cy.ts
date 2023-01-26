import { qase } from 'cypress-qase-reporter/dist/mocha';
import { faker } from '@faker-js/faker';
const { MainteancePage } = require('../../page-object/maintenance/maintenance.po');
const { MaintenaceStepLibraryPage } = require('../../page-object/maintenance/maintenance-step-library.po');
const { AddDocumentModal } = require('../../page-object/maintenance/components/add-document-modal.po');
const { ConfirmDeleteModal } = require('../../page-object/maintenance/components/confirm-delete-modal.po');

const maintenance = new MainteancePage();
const maintenanceStep = new MaintenaceStepLibraryPage();
const documentModal = new AddDocumentModal();
const confirmDeletionModal = new ConfirmDeleteModal();
let stepName;

describe('Mainteance step library - back navigation', () => {
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
  });

  beforeEach(() => {
    maintenanceStep.createStep.click({ force: true });
  });

  qase(
    29,
    it('Verify that CANCEL button while Creating a New Maintenance step is working correctly', () => {
      maintenanceStep.newStepWrapper.should('be.visible');
      cy.verifyURLContains('/steps-library/new');
      maintenanceStep.cancelButton.click({ force: true });
      maintenanceStep.confirmCancel.click({ force: true });
      maintenanceStep.wrapper.should('be.visible');
    }),
  );

  qase(
    82,
    it('Click on breadcrumbs - Maintenance step library', () => {
      maintenanceStep.newStepWrapper.should('be.visible');
      cy.verifyURLContains('/steps-library/new');
      cy.clickOnBreadcrumbLink('Maintenance step library');
      maintenanceStep.wrapper.should('be.visible');
    }),
  );
});

describe('Create maintenance step library', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
    maintenanceStep.createStep.click({ force: true });
    maintenanceStep.newStepWrapper.should('be.visible');
  });

  qase(
    35,
    it('Verify that ADD DOCUMENT button while Creating a New Maintenance step is working correctly', () => {
      maintenanceStep.addDocumentButton.click();
      documentModal.wrapper.should('be.visible');
      documentModal.title.should('be.visible');
      documentModal.checkboxDocument.eq(0).click();
      documentModal.addSelectedDocsBtn.click();
      maintenanceStep.documentAdded.should('be.visible');
    }),
  );

  qase(
    39,
    it('Verify that Close icon while adding a document in Create New Maintenance step is working correctly', () => {
      maintenanceStep.addDocumentButton.click({ force: true });
      documentModal.wrapper.should('be.visible');
      documentModal.title.should('be.visible');
      documentModal.closeButton.click({ force: true });
      documentModal.wrapper.should('not.exist');
    }),
  );

  qase(
    37,
    it('Verify that ABORT button while adding a document in Create New Maintenance step is working correctly', () => {
      maintenanceStep.addDocumentButton.click({ force: true });
      documentModal.wrapper.should('be.visible');
      documentModal.title.should('be.visible');
      documentModal.abortButton.click({ force: true });
      documentModal.wrapper.should('not.exist');
    }),
  );
});

describe('Maintenance step library - List of steps', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
  });

  qase(
    19,
    it('Verify that CANCEL button while deleting a Maintenance step is working correctly', () => {
      stepName = "Cancel modal - " + faker.datatype.number();
      cy.createNewMaintenanceStep(stepName);
      maintenanceStep.wrapper.should('be.visible');
      maintenanceStep.stepNameCell.should('be.visible');
      maintenanceStep.openStepMenu(stepName);
      maintenanceStep.deleteOption.click();
      confirmDeletionModal.cancelButton.click();
      maintenanceStep.stepNameCell.contains(stepName).should('be.visible');
    })
  );

  qase(
    15,
    it('Verify that search functionality of title column working correctly', () => {
      stepName = "Search step - " + faker.datatype.number();
      cy.createNewMaintenanceStep(stepName);
      maintenanceStep.searchInput.type(stepName);
      maintenanceStep.searchResultsTitle.should('be.visible')
        .should('have.text', stepName);
    })
  );

  afterEach(() => {
    cy.deleteMaintenanceStep('@stepId');
  });
});


describe('Verify that user is able to delete maintenance step', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.stepLibraryTab.click();
    maintenanceStep.wrapper.should('be.visible');
  });

  qase(
    20,
    it('Verify that CONFIRM button while deleting a Maintenance step is working correctly', () => {
      stepName = "Tarik - " + faker.datatype.number();
      cy.createNewMaintenanceStep(stepName);
      maintenanceStep.wrapper.should('be.visible');
      maintenanceStep.openStepMenu(stepName);
      maintenanceStep.deleteOption.click();
      confirmDeletionModal.confirmButton.click();
      maintenanceStep.stepNameCell.contains(stepName).should('not.exist');
    }),
  );
});