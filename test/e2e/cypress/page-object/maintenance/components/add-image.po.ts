export class AddImage {
  get wrapper() {
    return cy.get('mnt-procedure-step-images-form[formcontrolname="images"]');
  }
  get uploadElement() {
    return this.wrapper.find('input[type="file"]');
  }

  verifyImageIsUploaded(imageName: string, isUploaded: boolean) {
    if (isUploaded) {
      this.wrapper.find('.image-item .image-name').contains(imageName).should('be.visible');
    } else {
      this.wrapper.contains('.image-name', imageName).should('not.exist');
    }
  }

  deleteImage(imageName: string) {
    this.wrapper
      .find('.image-item .image-name')
      .contains(imageName)
      .siblings('.image-delete')
      .click();
  }
}
