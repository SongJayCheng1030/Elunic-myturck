import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SharedSessionService } from '@sio/common';

@Directive({
  selector: '[hasRight]',
})
export class HasRightDirective {
  hasView = false;

  constructor(
    private apiService: SharedSessionService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set hasRight(right: string) {
    if (!right) {
      this.setElement(true);
      return;
    }

    // TODO: FIXEME: implement

    // this.apiService.user__Rights.then(rights => {
    //   if (!rights || !rights.global) {
    //     this.setElement(false); return;
    //   }
    //   this.setElement(rights.global[right]);
    // });
  }

  private setElement(isShown: boolean) {
    if (isShown && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isShown && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
