// import { TenantId } from '../types';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  activated: boolean;
  firstName: string;
  lastName: string;
  // roleId?: string;
  imageId: string | null;
  preferredLanguage: string | null;
  // TODO:
  roles: any[];
}

// export interface CreateUserDto {
//   name: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   image?: string;
// }

// export type UpdateUserDto = Omit<CreateUserDto, 'password'>;

// export interface RoleDto {
//   id: string;
//   name: string;
//   description: string;
//   updatedAt?: string;
//   acl?: AclMap;
// }

// export interface PutRoleRequestDto {
//   id: string;
//   name?: string;
//   description?: string;
//   acl?: AclMap;
// }

// export interface PostRoleRequestDto {
//   name?: string;
//   description?: string;
//   acl?: AclMap;
// }

// export type CreateRoleDto = Omit<RoleDto, 'id'>;

// export interface FreeData {
//   key: string;
//   value: string;
// }

// export type AclMap<T extends string = string, S extends string = string> = {
//   [key in T]: Record<S, boolean>;
// };

// export interface AclDto {
//   id: string;
//   roleId: string;
//   resourceId: string;
//   rightKey: string;
// }

// export type CreateAclDto = Omit<AclDto, 'id'>;

// export interface CreateUserAclsDto {
//   userId: string;
//   tenantId: TenantId;
//   resourceId: string;
//   rightKeys: string[];
// }

// export interface DeleteResourceDto {
//   tenantId: TenantId;
//   resourceId: string;
// }
