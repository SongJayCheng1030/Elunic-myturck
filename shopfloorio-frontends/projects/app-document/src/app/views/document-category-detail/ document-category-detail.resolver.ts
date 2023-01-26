import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { DocumentService } from '@sio/common';
import { DocumentTypeDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class DocumentCategoryDetailsResolver implements Resolve<DocumentTypeDto | null> {
  constructor(private router: Router, private docService: DocumentService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<any | null> {
    const id = route.paramMap.get('id') as string;
    const documentType = await this.docService.getDocumentType(id);

    if (!documentType) {
      await this.router.navigate(['/']);
      return null;
    }
    return documentType;
  }
}
