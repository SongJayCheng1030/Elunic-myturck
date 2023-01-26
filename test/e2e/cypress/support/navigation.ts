declare namespace Cypress {
  interface Chainable {
    navigateToMaintenanceManager(): void;
  }
}

Cypress.Commands.add('navigateToMaintenanceManager', () => {
    cy.get('.services app-tile-card:nth-child(1)').click();
});
