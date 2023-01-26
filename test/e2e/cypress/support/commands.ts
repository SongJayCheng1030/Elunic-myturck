/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void;
    verifyURLContains(url: string): void;
    clickOnBreadcrumbLink(url: string): void;
    selectOptionFromDropdown(option: string): void;
    addNewTagFromDropdown(): void;
    navigateToBaseURL(url: string): void;
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
      cy.get('#username').clear().type(email);
      cy.get('#password').clear().type(password);
      cy.get('#kc-login').click();
});

Cypress.Commands.add('navigateToBaseURL', (url) => {
  if (url.toLowerCase().indexOf('localhost') === -1) {
    cy.visit(Cypress.env('URL'));
    cy.login(Cypress.env("USERNAME"), Cypress.env("PASSWORD"));
  } else {
    cy.visit(Cypress.env('URL'));
  }
});

Cypress.Commands.add('verifyURLContains', (url: String) => {
  cy.url().should('contains', url);
});

Cypress.Commands.add('clickOnBreadcrumbLink', (breadcrumbText: string) => {
  cy.get('.navigation a u').contains(breadcrumbText).click();
});

Cypress.Commands.add('selectOptionFromDropdown', (option: string) => {
  cy.get('ng-dropdown-panel .ng-option').contains(option).click();
});

Cypress.Commands.add('addNewTagFromDropdown', () => {
  cy.get('ng-dropdown-panel div[role="option"]').find('span').contains('Add item').click();
});
