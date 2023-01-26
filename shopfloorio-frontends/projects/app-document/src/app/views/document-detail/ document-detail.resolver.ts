import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { DocumentService } from '@sio/common';
import { DocumentDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class DocumentDetailsResolver implements Resolve<DocumentDto | null> {
  constructor(private router: Router, private docService: DocumentService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<DocumentDto | null> {
    const id = route.paramMap.get('id') as string;
    const document = await this.docService.getDocument(id, true);
    if (!document) {
      await this.router.navigate(['/']);
      return null;
    }
    return document;
  }
}
