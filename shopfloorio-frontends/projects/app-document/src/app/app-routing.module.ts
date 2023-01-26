import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentCategoryDetailsResolver } from './views/document-category-detail/ document-category-detail.resolver';
import { DocumentCategoryDetailComponent } from './views/document-category-detail/document-category-detail.component';
import { DocumentDetailsResolver } from './views/document-detail/ document-detail.resolver';
import { DocumentDetailComponent } from './views/document-detail/document-detail.component';
import { DocumentComponent } from './views/document-tabs-outlet/document/document.component';
import { DocumentCategoryComponent } from './views/document-tabs-outlet/document-category/document-category.component';
import { DocumentTabsOutletComponent } from './views/document-tabs-outlet/document-tabs-outlet.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentTabsOutletComponent,
    children: [
      { path: '', redirectTo: 'documents', pathMatch: 'full' },
      { path: 'documents', component: DocumentComponent },
      { path: 'document-category', component: DocumentCategoryComponent },
    ],
  },
  {
    path: 'documents/new',
    component: DocumentDetailComponent,
  },
  {
    path: 'documents/:id',
    component: DocumentDetailComponent,
    resolve: { document: DocumentDetailsResolver },
  },
  {
    path: 'document-category/new',
    component: DocumentCategoryDetailComponent,
  },
  {
    path: 'document-category/:id',
    component: DocumentCategoryDetailComponent,
    resolve: { documentType: DocumentCategoryDetailsResolver },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
