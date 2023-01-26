import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Logger, MultilangDirective, Right, Role, UserService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, Subscription } from 'rxjs';

export interface ResourceRightTableInputData {
  resourceName: string;
  form: FormGroup;
}

@Component({
  selector: 'app-role-detail-page',
  templateUrl: './role-detail-page.component.html',
  styleUrls: ['./role-detail-page.component.scss'],
})
export class RoleDetailPageComponent implements OnInit, OnDestroy {
  private logger = new Logger('RoleDetailPageComponent');

  private roleId: string;

  role!: Role;

  name = new FormControl('');

  isOnEditMode = false;

  subscriptions: Subscription[] = [];

  allRights$ = this.userService.listAllRights$();

  constructor(
    private activeRouter: ActivatedRoute,
    private toastrService: ToastrService,
    private userService: UserService,
    private router: Router,
    private readonly translate: TranslateService,
  ) {
    this.roleId = activeRouter.snapshot.params['id'];

    if (this.isNew) {
      this.role = {
        id: '',
        key: '',
        name: {
          [this.translate.currentLang]: '',
        },
        description: {},
        rights: [],
      };
    }
  }

  get isNew(): boolean {
    return this.roleId === 'create';
  }

  async ngOnInit(): Promise<void> {
    if (!this.isNew) {
      this.userService.getRoleById$(this.roleId).subscribe(role => {
        this.logger.debug(`Role loaded:`, role);
        this.role = role;
        this.name.setValue(MultilangDirective.translate(this.role.name || {}, this.translate));
      });
    }
  }

  get pageTitle(): string {
    if (this.isNew) {
      return this.translate.instant('NEW_ROLE');
    } else {
      if (!this.role) {
        return '';
      }

      return MultilangDirective.translate(this.role.name || {}, this.translate);
    }
  }

  hasRight(right: Right): boolean {
    if (!this.role || !this.role.rights) {
      return false;
    }

    // @ts-ignore
    return this.role.rights.findIndex(p => p.key === right.key) > -1;
  }

  updateRights(right: Right, checked: boolean): void {
    if (!this.role) {
      return;
    }

    if (!this.role.rights) {
      this.role.rights = [];
    }

    if (checked) {
      this.role.rights.push(right);
    } else {
      // @ts-ignore
      const idx = this.role.rights.findIndex(p => p.key === right.key);
      if (idx > -1) {
        this.role.rights.splice(idx, 1);
      }
    }
  }

  async submit() {
    const data: any = {
      key: this.role.key,
      name: {
        ...(this.role?.name && !!this.role.name ? this.role.name : {}),
        [this.translate.currentLang]: this.name.value,
      },
      rights: this.role.rights || [],
      description: {
        ...(this.role?.description && !!this.role.description ? this.role.description : {}),
      },
    };

    const exHandler = (ex: Error) => {
      this.logger.error(`role operation failed:`, this.roleId, ex);

      if (ex instanceof HttpErrorResponse) {
        this.toastrService.error(ex.error.error.message, 'Http Error', {
          timeOut: 5000,
          extendedTimeOut: 5000,
        });
      }

      return of();
    };

    if (this.isNew) {
      this.logger.debug(`create role:`, data);
      this.userService
        .createRole$(data)
        .pipe(catchError(exHandler))
        .subscribe(newRole => {
          this.logger.debug(`new role created:`, newRole);
          this.router.navigate(['/roles']);
        });
    } else {
      this.logger.debug(`update role:`, data);
      this.userService
        .updateRole$(this.roleId, data)
        .pipe(catchError(exHandler))
        .subscribe(updateRole => {
          this.logger.debug(`role updated:`, updateRole);
          this.router.navigate(['/roles']);
        });
    }
  }

  async deleteRole() {
    if (this.role) {
      this.userService
        .deleteRole$(this.roleId)
        .pipe(
          catchError(e => {
            this.logger.error(`deleteRole failed:`, e);
            if (e instanceof HttpErrorResponse) {
              this.toastrService.error(e.error.error.message, 'Http Error', {
                timeOut: 5000,
                extendedTimeOut: 5000,
              });
            }
            return of(false);
          }),
        )
        .subscribe(ok => {
          if (ok !== false) {
            this.router.navigate(['/roles']);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
