import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '@sio/common';
import { combineLatest, from, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { DocumentTypeDto } from 'shared/common/models';

interface Tab {
  label: string;
  link: string;
  showHistory: boolean;
  createBtn: {
    label: string;
    link: string;
  };
}

@Component({
  selector: 'app-document-tabs-outlet',
  templateUrl: './document-tabs-outlet.component.html',
  styleUrls: ['./document-tabs-outlet.component.scss'],
})
export class DocumentTabsOutletComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  selectedDocType$!: Observable<DocumentTypeDto | undefined>;

  selectedTabIndex = 0;
  search: FormControl = new FormControl(null);
  typeId: FormControl = new FormControl(null);
  docTypes$ = from(this.docService.getDocumentTypes());

  tabs: Tab[] = [
    {
      label: 'VIEWS.DOCUMENT_TABS.ALL_DOCUMENTS',
      link: '/documents',
      showHistory: true,
      createBtn: { label: 'VIEWS.DOCUMENT_TABS.CREATE_NEW_DOCUMENT', link: '/documents/new' },
    },
    {
      label: 'VIEWS.DOCUMENT_TABS.DOCUMENT_TYPES',
      link: '/document-category',
      showHistory: true,
      createBtn: {
        label: 'VIEWS.DOCUMENT_TABS.CREATE_NEW_DOCUMENT_TYPE',
        link: '/document-category/new',
      },
    },
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private docService: DocumentService,
  ) {}

  ngOnInit(): void {
    this.docTypes$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      const path = this.getPath();
      this.selectedTabIndex = this.getSelectedTabIndex(path);

      const params = this.activatedRoute.snapshot.queryParams;
      this.search.setValue(params.q || null);
      this.typeId.setValue(params.typeId || null);
    });

    this.selectedDocType$ = combineLatest([this.docTypes$, this.typeId.valueChanges])
      .pipe(takeUntil(this.destroyed$))
      .pipe(map(([docTypes, typeId]) => docTypes.find(type => type.id === typeId)));

    this.search.valueChanges
      .pipe(takeUntil(this.destroyed$), distinctUntilChanged(), debounceTime(250))
      .subscribe(term => {
        const params = this.docService.createHttpQueryParams({
          q: term,
          typeId: this.typeId.value,
        });
        this.router.navigate([this.getPath()], { queryParams: params });
      });

    this.typeId.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(typeId => {
      const params = this.docService.createHttpQueryParams({ q: this.search.value, typeId });
      this.router.navigate([this.getPath()], { queryParams: params });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onDocTypeChange(type: DocumentTypeDto): void {
    this.typeId.setValue(type.id || null);
  }

  resetDocType(): void {
    this.typeId.setValue(null);
  }

  onNavigate(index: number): void {
    this.selectedTabIndex = index;
    this.search.setValue(null, { emitEvent: false });
    this.typeId.setValue(null);
    this.router.navigate([this.tabs[index].link]);
  }

  private getSelectedTabIndex(currentUrl: string): number {
    const index = this.tabs.findIndex(tab => tab.link === currentUrl);
    return index > -1 ? index : 0;
  }

  private getPath() {
    return this.router.url.split('?')[0];
  }
}
