export class AddDocumentModal {
  get wrapper() {
    return cy.get('app-modal-document');
  }
  get title() {
    return this.wrapper.find('.modal-header');
  }
  get closeButton() {
    return this.wrapper.find('.modal-header button:nth-child(2)');
  }

  get abortButton() {
    return this.wrapper.find('.modal-footer > button');
  }

  get checkboxDocument() {
    return cy.get('.modal-body label>.checkbox-tick');
  }

  get addSelectedDocsBtn() {
    return this.wrapper.find('.btn-primary');
  }
}
