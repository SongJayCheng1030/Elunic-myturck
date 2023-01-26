import { qase } from 'cypress-qase-reporter/dist/mocha';
import { faker } from '@faker-js/faker';
import { Constants } from '../../support/constant';
const { MainteancePage } = require('../../page-object/maintenance/maintenance.po');
const { MaintenanceLibrary } = require('../../page-object/maintenance/maintenance-library.po');
const { NewMaintenancePlan } = require('../../page-object/maintenance/new-maintenance-plan.po');
const {
  ConfirmationModal,
} = require('../../page-object/maintenance/components/confirmation-modal.po');
const {
  AddDocumentModal,
} = require('../../page-object/maintenance/components/add-document-modal.po');
const { AddImage } = require('../../page-object/maintenance/components/add-image.po');
const { MaintenaceStepLibraryPage } = require('../../page-object/maintenance/maintenance-step-library.po');
const data = require('../../fixtures/i18n/en.json');

const maintenance = new MainteancePage();
const maintenanceLibrary = new MaintenanceLibrary();
const newMaintenancePlan = new NewMaintenancePlan();
const confirmation = new ConfirmationModal();
const addDocument = new AddDocumentModal();
const image = new AddImage();
const maintenanceStep = new MaintenaceStepLibraryPage();
const documentModal = new AddDocumentModal();

let stepName, maintenanceName, newStepName;

describe('Maintenance plans', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();
  });

  qase(
    77,
    it('Verify user can close Leave without saving modal', () => {
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.wrapper.should('be.visible');
      newMaintenancePlan.cancelButton.click();
      confirmation.wrapper.should('be.visible');
      confirmation.closeButton.click();
      confirmation.wrapper.should('not.exist');
    }),
  );

  qase(
    8,
    it('Verify that Interval unit accepting only numbers', () => {
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.intervalUnit.click();
      newMaintenancePlan.intervalUnitOptions.each((item, index) => {
        cy.wrap(item).should('contain.text', data.newMaintenancePlan.intervalUnit[index])
      })
      newMaintenancePlan.intervalUnit.find('input').type('AnyString', {delay: 60});
      newMaintenancePlan.intervalUnit
        .find('.ng-option-disabled')
        .should('contain', data.newMaintenancePlan.intervalUnitMessage);
    }),
  );

  qase(
    21,
    it('Verify user can close "Add step"', () => {
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.addStepButton.click();
      newMaintenancePlan.stepLibrary.should('be.visible');
      newMaintenancePlan.stepLibraryClose.click();
      newMaintenancePlan.stepLibrary.should('not.exist');
    }),
  );

  qase(
    46,
    it('Verify that "Close" button is working correctly while adding a document in Create New Maintenance plans', () => {
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.addFirstStepButton.click();
      newMaintenancePlan.addDocument.click();
      addDocument.wrapper.should('be.visible');
      addDocument.title.should('contain', data.addDocumentModal.header);
      addDocument.closeButton.click();
      addDocument.wrapper.should('not.exist');
    }),
  );

  qase(
    45,
    it('Verify that "Abort" button is working correctly while adding a document in Create New Maintenance plans', () => {
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.addFirstStepButton.click();
      newMaintenancePlan.addDocument.click();
      addDocument.wrapper.should('be.visible');
      addDocument.title.should('contain', data.addDocumentModal.header);
      addDocument.abortButton.click();
      addDocument.wrapper.should('not.exist');
    }),
  );

  qase(
    12,
    it('Verify that "remove step" is working correctly', () => {
      stepName = 'Remove step ';
      maintenanceName = stepName + faker.lorem.word();
      let planDescription = faker.lorem.word();
      cy.intercept('GET', Cypress.env('URL') + Constants.maintenancePlansPath).as('dataLoaded');
      // creating plan with one step
      cy.createNewMaintenancePlan(maintenanceName, planDescription);
      // wait until page will fully loaded
      maintenanceLibrary.wrapper.should('be.visible');
      maintenanceLibrary.loadingLabel.should('not.exist');
      cy.wait('@dataLoaded').its('response.statusCode').should('eq', 200);
      // open edit option
      maintenanceLibrary.openPlanMenu(maintenanceName);
      maintenanceLibrary.editOption.click();
      // check that plan has one step
      newMaintenancePlan.maintenanceStepsHeader.should('contain', '(1)');
      // remove step
      newMaintenancePlan.stepInList.click();
      newMaintenancePlan.removeStepButton.click();
      newMaintenancePlan.maintenanceStepsHeader.should('contain', '(0)');
      newMaintenancePlan.stepInList.should('not.exist');
    }),
  );
});

describe('Maintenance plan - Create new plan - Search step functionality', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();
  });

  afterEach(() => {
    cy.deleteMaintenanceStep('@stepId');
  });

  qase(
    22,
    it('Verify that search functionality of Choose maintenance step from library', () => {
      stepName = 'Search step from library ';
      newStepName = stepName + faker.lorem.word();
      cy.createNewMaintenanceStep(newStepName);
      maintenanceLibrary.createMaintenance.click();
      newMaintenancePlan.addStepButton.click();
      newMaintenancePlan.searchInputAddStep.click().type(newStepName);
      newMaintenancePlan.searchResultAddStep.should('have.text', newStepName);
    }),
  );
});

describe('Maintenance plans - Navigation', () => {
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();
  });

  beforeEach(() => {
    maintenanceLibrary.createMaintenance.click();
  });

  qase(
    2,
    it('Verify user can leave Create new plan without saving', () => {
      newMaintenancePlan.wrapper.should('be.visible');
      newMaintenancePlan.cancelButton.click();
      confirmation.wrapper.should('be.visible');
      confirmation.cancelButton.click();
      maintenanceLibrary.wrapper.should('be.visible');
    }),
  );

  qase(
    79,
    it('Click on Breadcrumbs - Maintenance plans', () => {
      newMaintenancePlan.wrapper.should('be.visible');
      cy.verifyURLContains('/procedures/new');
      cy.clickOnBreadcrumbLink('Maintenance plans');
      maintenanceLibrary.wrapper.should('be.visible');
    }),
  );
});

describe('Maintenance plan - Create new plan - Positive', () => {
  let maintenanceDescription = faker.lorem.sentence();
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();
    maintenanceLibrary.createMaintenance.click();
  });

  afterEach(() => {
    cy.deleteMaintenancePlan('@planId');
  });

  qase(
    86,
    it('Verify that User is able to create new maintenance plan', () => {
      maintenanceName = `Create new plan ${faker.lorem.word()}`;

      cy.intercept('POST', Cypress.env('URL') + Constants.maintenancePlansPath).as('planCreated');
      // Enter new maintenance data
      newMaintenancePlan.procedureNameInput.type(maintenanceName);
      newMaintenancePlan.selectAssetType('Generic');
      newMaintenancePlan.description.type(maintenanceDescription);
      newMaintenancePlan.intervalInput.type('2');
      newMaintenancePlan.addStepButton.click();
      newMaintenancePlan.createNewStepBtn.click();
      newMaintenancePlan.newStepTitle.type(faker.lorem.word());
      newMaintenancePlan.newStepDescription.type(faker.lorem.sentence());
      newMaintenancePlan.createButton.click();
      cy.wait('@planCreated').its('response.body.data.id').as('planId');
      // Verify maintenance is created
      maintenanceLibrary.wrapper.should('be.visible');
      maintenanceLibrary.loadingLabel.should('not.exist');

      maintenanceLibrary.verifyMaintenanceExist(maintenanceName);
    }));

    qase(
      3,
      it('Verify can we "Add step" in Maintances step', () => {
        maintenanceName = `Add step ${faker.lorem.word()}`;
        let countOfSteps = '1';
        cy.intercept('POST', Cypress.env('URL') + Constants.maintenancePlansPath).as('planCreated');
        // Enter new maintenance data
        newMaintenancePlan.procedureNameInput.type(maintenanceName);
        newMaintenancePlan.selectAssetType('Generic');
        newMaintenancePlan.description.type(maintenanceDescription);
        newMaintenancePlan.intervalInput.type('42');
        // Add one step
        newMaintenancePlan.addStepButton.click();
        newMaintenancePlan.createNewStepBtn.click();
        newMaintenancePlan.newStepTitle.type(faker.lorem.word());
        newMaintenancePlan.newStepDescription.type(faker.lorem.sentence());
        newMaintenancePlan.createButton.click();
        cy.wait('@planCreated').its('response.body.data.id').as('planId');
        maintenanceLibrary.wrapper.should('be.visible');
        maintenanceLibrary.loadingLabel.should('not.exist');
        maintenanceLibrary.expectCountOfSteps(maintenanceName, countOfSteps);
      })
    );

    qase(
      4,
      it('Verify can we "Add the first step" in Maintances step', () => {
        maintenanceName = `Add the first step ${faker.lorem.word()}`;
        let countOfSteps = '1';
        cy.intercept('POST', Cypress.env('URL') + Constants.maintenancePlansPath).as('planCreated');
        // Enter new maintenance data
        newMaintenancePlan.procedureNameInput.type(maintenanceName);
        newMaintenancePlan.selectAssetType('Generic');
        newMaintenancePlan.description.type(maintenanceDescription);
        newMaintenancePlan.intervalInput.type('44');
        // Add first step
        newMaintenancePlan.addFirstStepButton.click();
        newMaintenancePlan.newStepTitle.type(faker.lorem.word());
        newMaintenancePlan.newStepDescription.type(faker.lorem.sentence());
        newMaintenancePlan.createButton.click();
        cy.wait('@planCreated').its('response.body.data.id').as('planId');
        maintenanceLibrary.loadingLabel.should('not.exist');
        maintenanceLibrary.wrapper.should('be.visible');
        maintenanceLibrary.expectCountOfSteps(maintenanceName, countOfSteps);
      })
    );
});

describe('Maintenance plan - Create new plan - Negative', () => {
  let maintenanceName = faker.lorem.word();;
  let maintenanceDescription = faker.lorem.sentence();
  before(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();
  });

  beforeEach(() => {
    maintenanceLibrary.createMaintenance.click();
  });

  qase(
    87,
    it('Verify that Saving without adding steps is not possible', () => {
      newMaintenancePlan.procedureNameInput.type(maintenanceName);
      newMaintenancePlan.selectAssetType('Generic');
      newMaintenancePlan.description.type(maintenanceDescription);
      newMaintenancePlan.intervalInput.type('2');
      newMaintenancePlan.createButton.should('be.disabled');
    }));
});

describe('Maintenance plans - Create new plan - Media', () => {
  beforeEach(() => {
    cy.navigateToBaseURL(Cypress.env('URL'));
    cy.navigateToMaintenanceManager();
    maintenance.plansTab.click();

    maintenanceLibrary.createMaintenance.click();
    newMaintenancePlan.wrapper.should('be.visible');
    cy.verifyURLContains('/procedures/new');
    newMaintenancePlan.addStepButton.click();
    newMaintenancePlan.createNewStepBtn.click();
  });

  qase(
    80,
    it('Verify that "Delete" button in Images Section is working correctly while Creating a new Maintenance plan', () => {
      cy.intercept('POST', Cypress.env('URL') + Constants.newPlanMediaPath).as('imageUploaded');
      cy.intercept('DELETE', Constants.newPlanMediaPath + '/*').as('imageDeleted');
      image.uploadElement.attachFile('stockholm.jpeg');
      cy.wait('@imageUploaded')
      image.deleteImage('stockholm.jpeg');
      cy.wait('@imageDeleted');
      image.verifyImageIsUploaded('stockholm.jpeg', false);
    })
  );

  qase(
    81,
    it('Verify that "Delete" button in Documents Section is working correctly while Creating a new maintenance plan', () => {
      maintenanceStep.addDocumentButton.click();
      documentModal.wrapper.should('be.visible');
      documentModal.title.should('be.visible');
      documentModal.checkboxDocument.eq(0).click();
      documentModal.addSelectedDocsBtn.click();
      newMaintenancePlan.documentAdded.should('be.visible');
      newMaintenancePlan.deleteDocumentBtn.click();
      newMaintenancePlan.documentAdded.should('not.exist');
    })
  );

  qase(
    11,
    it('Verify that "add image" is working correctly', () => {
      cy.intercept('POST', Cypress.env('URL') + Constants.newPlanMediaPath).as('imageUploaded');
      image.uploadElement.attachFile('stockholm.jpeg');
      cy.wait('@imageUploaded');
      image.verifyImageIsUploaded('stockholm.jpeg', true);
    })
  );

  qase(
    13,
    it('Verify that "add document" is working correctly', () => {
      maintenanceStep.addDocumentButton.click();
      documentModal.wrapper.should('be.visible');
      documentModal.title.should('be.visible');
      documentModal.checkboxDocument.eq(0).click();
      documentModal.addSelectedDocsBtn.click();
      newMaintenancePlan.documentAdded.should('be.visible');
    })
  );
});
