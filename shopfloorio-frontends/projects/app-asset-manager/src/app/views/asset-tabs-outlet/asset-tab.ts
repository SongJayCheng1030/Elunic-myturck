import { BreakpointObserver } from '@angular/cdk/layout';
import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetService, defaultThumbnailSize } from '@sio/common';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Directive()
export class AssetTabDirective implements OnInit, OnDestroy {
  protected destroyed$ = new Subject<void>();

  searchTerm = '';
  defaultThumbnailSize = defaultThumbnailSize;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected assetService: AssetService,
    public breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroyed$),
        map(params => params['q']),
      )
      .subscribe(term => (this.searchTerm = term || ''));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
