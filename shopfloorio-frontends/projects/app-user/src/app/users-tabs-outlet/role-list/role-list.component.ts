import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@sio/common';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';
import { RoleDto } from 'shared/common/models';

interface RoleRow extends RoleDto {
  action: Function;
}

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
})
export class RoleListComponent implements OnInit {
  roles: RoleDto[] = [];

  constructor(private userService: UserService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    const rows = (await lastValueFrom(this.userService.listAllRoles$())) as any as RoleDto[];
    this.roles = this.mapRolesDate(rows);
  }

  mapRolesDate(rows: RoleDto[]): RoleRow[] {
    return rows.map(row => {
      return {
        ...row,
        updatedAt: moment(row.updatedAt).format('DD.MM.yyyy | HH:mm'),
        action: () => this.router.navigate([`roles/${row.id}`]),
      };
    });
  }
}
