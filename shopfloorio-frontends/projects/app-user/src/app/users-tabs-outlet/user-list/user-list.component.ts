import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService, IconUrlPipe, UserService } from '@sio/common';
import { Subscription, Observable, map } from 'rxjs';
import { UserDto } from 'shared/common/models';
import { UsersQuery } from '@sio/common';

interface UserRow extends UserDto {
  action: Function;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users$: Observable<UserRow[]> = this.userQuery.filteredUsers$.pipe(
    map(users => {
      return users.map(user => {
        return {
          ...user,
          image: user.imageId
            ? this.fileService.getImgUrl(user.imageId)
            : 'assets/icons/incognito.svg',
          action: () => this.router.navigate([`users/${user.id}`]),
        };
      });
    }),
  );

  usersLoaded$ = this.userQuery.selectLoading().pipe(map(loading => !loading));

  subscriptions: Subscription[] = [];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly userQuery: UsersQuery,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(this.userService.loadUsers$().subscribe());

    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params =>
        this.userService.setFilters({ q: params.q }),
      ),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getAvatarImageForUser(user: UserDto): string {
    if (user && user.imageId) {
      return IconUrlPipe.do(user.imageId);
    }
    return 'assets/icons/incognito.svg';
  }
}
