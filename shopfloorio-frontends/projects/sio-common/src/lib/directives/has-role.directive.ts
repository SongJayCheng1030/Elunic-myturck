import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { SharedSessionService } from '../services/shared-session.service';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  hasView = false;

  constructor(
    private apiService: SharedSessionService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set hasRole(role: string) {
    if (!role) {
      this.setElement(true);
      return;
    }

    // TODO: FIXME

    // const userRoles = this.apiService.userInfo?.roles || [];
    // if (userRoles.map(g => g.toLowerCase()).includes(role.toLowerCase())) {
    //   this.setElement(true); return;
    // }
    // this.setElement(false); return;
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
