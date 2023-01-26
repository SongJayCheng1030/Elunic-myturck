import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  FileService,
  IconUrlPipe,
  Logger,
  ModalConfirmComponent,
  UpdateUserDto,
  UserService,
} from '@sio/common';
import { omit } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  catchError,
  from,
  map,
  merge,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { UserDto } from 'shared/common/models';

import { validatePassword, validatePasswordConfirm } from './password-util';

const EMAIL_PATTERN =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@UntilDestroy()
@Component({
  selector: 'app-user-detail-page',
  templateUrl: './user-detail-page.component.html',
  styleUrls: ['./user-detail-page.component.scss'],
})
export class UserDetailPageComponent implements OnInit {
  private logger = new Logger('UserDetailPageComponent');

  userId!: string;

  user!: UserDto;

  formGroup!: FormGroup;

  roles$ = this.userService.listAllRoles$();

  strength$ = new BehaviorSubject<[number, object] | null>(null);

  hasNoImage$!: Observable<boolean>;

  attachedUserImage?: string | null;

  userUploadedImages: string[] = [];

  constructor(
    activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
    private readonly router: Router,
    private readonly fileService: FileService,
    private readonly userService: UserService,
    private readonly toastrService: ToastrService,
  ) {
    this.userId = activatedRoute.snapshot.params['id'];

    this.initFormGroup();

    this.user = {
      id: '',
      name: '',
      email: '',
      activated: false,
      firstName: '',
      lastName: '',
      roleId: '',
      image: null,
      preferredLanguage: '',
      imageId: null,
      roles: [],
    } as UserDto;
  }

  get isNew(): boolean {
    return this.userId === 'create';
  }

  private initFormGroup() {
    const passwordValidator = [validatePassword(this.strength$.next.bind(this.strength$))];
    const confirmPasswordValidator = [validatePasswordConfirm('password')];
    if (this.isNew) {
      passwordValidator.push(Validators.required);
      confirmPasswordValidator.push(Validators.required);
    }

    this.formGroup = new FormGroup({
      name: new FormControl({ value: '', disabled: !this.isNew }, [
        Validators.required,
        Validators.minLength(1),
      ]),

      email: new FormControl('', [
        Validators.pattern(EMAIL_PATTERN),
        Validators.required,
        Validators.minLength(4),
      ]),

      firstName: new FormControl('', Validators.required),

      lastName: new FormControl('', Validators.required),

      roles: new FormControl([]),

      imageId: new FormControl(null),

      password: new FormControl('', passwordValidator),

      confirmPassword: new FormControl('', confirmPasswordValidator),
    });
  }

  ngOnInit() {
    if (!this.isNew) {
      this.userService.byId$(this.userId).subscribe(user => {
        this.logger.debug(`loaded user:`, user);

        this.formGroup.patchValue(user);
        this.user = user;
        this.attachedUserImage = user?.imageId;
      });
    }

    this.formGroup
      .get('password')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe(() => {
        const confirmPasswordControl = this.formGroup.get('confirmPassword');
        if (confirmPasswordControl?.value) {
          confirmPasswordControl.updateValueAndValidity();
        }
      });

    this.hasNoImage$ = this.formGroup.controls.imageId.valueChanges.pipe(
      map(imageId => !imageId),
      startWith(false),
    );
  }

  onSubmit() {
    const data = this.formGroup.value;
    const user: UpdateUserDto = {
      user: omit(data, ['password', 'confirmPassword']),
      options: {
        sendResetPasswordMail: false,
        setPassword: !!data.password && data.password === data.confirmPassword,
        password: data.password,
      },
    };

    const exHandler = (ex: Error) => {
      this.logger.error(`user operation failed:`, this.userId, ex);

      if (ex instanceof HttpErrorResponse) {
        const message =
          ex.error?.error && typeof ex.error.error === 'string'
            ? ex.error.error
            : ex.error?.error?.message;

        this.toastrService.error(message, 'Error', {
          timeOut: 5000,
          extendedTimeOut: 5000,
        });
      }

      return of(false);
    };

    if (this.isNew) {
      this.logger.debug(`create user:`, user);

      this.userService
        .createUser$(user)
        .pipe(
          catchError(exHandler),
          switchMap(createdUser => {
            if (createdUser) {
              return from(this.deleteUserUploadedFiles()).pipe(map(() => true));
            }

            return of(false);
          }),
        )
        .subscribe(created => {
          if (created) {
            this.router.navigate(['/']);
          }
        });
    } else {
      this.logger.debug(`update user:`, user);

      this.userService
        .updateUser$(this.userId, user)
        .pipe(
          catchError(exHandler),
          switchMap(updatedUser => {
            if (updatedUser) {
              return merge(this.deleteUserUploadedFiles(), this.deleteUserServerImage()).pipe(
                map(() => true),
              );
            }

            return of(false);
          }),
        )
        .subscribe(updated => {
          if (updated) {
            this.router.navigate(['/']);
          }
        });
    }
  }

  onDelete(): void {
    from(this.openConfirmModal())
      .pipe(switchMap(result => (result === 'confirm' ? this.deleteUser$() : of(null))))
      .subscribe();
  }

  get userImage(): string {
    if (this.user && this.user.imageId) {
      return IconUrlPipe.do(this.user.imageId);
    }
    return 'assets/icons/incognito.svg';
  }

  async onImageChoose(files: FileList | File[]) {
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) {
      return;
    }

    this.logger.debug(`onImageChoose():`, file);
    const fileData = await this.fileService.uploadFile(file);
    this.logger.debug(`upload result:`, fileData);

    // If impage is present
    if (!!this.user?.imageId || this.formGroup.get('imageId')?.value) {
      this.onClearImage();
    }

    this.formGroup.patchValue({ imageId: fileData.id });
    this.formGroup.get('imageId')?.markAsDirty();
    if (this.user) {
      this.user.imageId = fileData.id;
    }

    if (this.attachedUserImage !== fileData.id) {
      this.userUploadedImages.push(fileData.id);
    }
  }

  async onClearImage() {
    const id = this.user?.imageId || this.formGroup.get('imageId')?.value;
    if (!id) {
      this.logger.warn(`clearImage(): no image set to clear`);
      return;
    }

    this.formGroup.patchValue({ imageId: null });
    this.formGroup.get('imageId')?.markAsDirty();
    if (this.user) {
      this.user.imageId = null;
    }
  }

  onCancel() {
    this.deleteUserUploadedFiles(true).subscribe();
    this.router.navigate(['/']);
  }

  private deleteUserUploadedFiles(cancel = false) {
    // last item is what user want to save
    const files = !cancel ? this.userUploadedImages.slice(0, -1) : this.userUploadedImages;

    return this.fileService.deleteFiles(files);
  }

  private deleteUserServerImage() {
    if (this.attachedUserImage) {
      return this.fileService.deleteFile(this.attachedUserImage);
    }

    return of(undefined);
  }

  private deleteUser$(): Observable<boolean | void> {
    return this.userService.deleteUser$(this.user.id).pipe(
      tap(() => this.router.navigate(['/'])),
      catchError(ex => {
        this.logger.error(`Cannot delete user:`, this.user.id, ex);
        this.toastrService.error('The user cannot be deleted.', 'Delete user', {
          timeOut: 5000,
          extendedTimeOut: 5000,
        });
        return of(false);
      }),
    );
  }

  private openConfirmModal(): Promise<string> {
    const modal = this.modalService.open(ModalConfirmComponent, {
      centered: true,
      backdrop: 'static',
    });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_USER_CONFIRM.TITLE',
      body: 'MODALS.DELETE_USER_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_USER_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_USER_CONFIRM.ABORT',
      custom: {
        class: 'custom-modal',
        confirmButton: {
          class: 'btn-confirm',
        },
        abortButton: {
          class: 'btn-abort',
        },
      },
    };
    return modal.result;
  }
}
