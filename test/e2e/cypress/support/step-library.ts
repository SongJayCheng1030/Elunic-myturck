declare namespace Cypress {
  interface Chainable {
    verifyStepInTable(name: string, tag: string): void;
  }
}

// This needs to be extended
Cypress.Commands.add('verifyStepInTable', (name: string, tag: string) => {
  cy.get('div[role="rowgroup"] div[col-id="name"]')
    .contains(name).scrollIntoView()
    .should('be.visible')
    .parent()
    .find('div[col-id="tags"]')
    .contains(tag);
});
