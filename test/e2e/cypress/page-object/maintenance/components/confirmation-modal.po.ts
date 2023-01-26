export class ConfirmationModal {
  get wrapper() {
    return cy.get('lib-modal-confirm');
  }
  get closeButton() {
    return this.wrapper.find('.modal-header button');
  }

  get cancelButton() {
    return cy.get('lib-modal-confirm .modal-footer .btn-abort');
  }

  get saveButton() {
    return cy.get('lib-modal-confirm .modal-footer .btn-confirm');
  }
}
