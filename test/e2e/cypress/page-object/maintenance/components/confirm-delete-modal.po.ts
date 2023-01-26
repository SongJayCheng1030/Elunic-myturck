const data = require('../../../fixtures/i18n/en.json');

export class ConfirmDeleteModal {
    get confirmDeletionWrapper() {
        return cy.get('[class="modal-content"]');
    }

    get confirmButton() {
        return cy.get('.btn-confirm').contains(data.button.confirm);
    }
    
    get cancelButton() {
        return cy.get('.btn-abort').contains(data.button.cancel);
    }
}  