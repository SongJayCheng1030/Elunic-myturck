// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import jwtDecode from 'jwt-decode';
// import { CookieService } from 'ngx-cookie';
// import { lastValueFrom } from 'rxjs';
// import { FreeData, UserDto } from '../models';
// import { DataResponse } from '../models';
// import { AuthInfo } from 'shared/common/types';
// import urlJoin from 'url-join';
// import { Logger } from '../util/logger';

// export interface UserRights {
//   [resourceKey: string]: {
//     [rightKey: string]: boolean;
//   };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class SessionService {

//   private logger = new Logger('SessionService');

//   _userRights!: UserRights;
//   userInfo!: AuthInfo;
//   userImgUrl = '';

//   constructor(private http: HttpClient, private cookieService: CookieService) {}

//   async initializeService(): Promise<void> {
//     try {
//       const sessionData = await Promise.all([
//         /*this.http
//           .get<DataResponse<UserRights>>(urlJoin(this.environment.userServiceUrl, 'v1/me/rights'))
//           .toPromise(),
// */
//         Promise.resolve({}),

//         this.http
//           .get<DataResponse<AuthInfo>>(urlJoin(this.environment.userServiceUrl, '/v1/users/user/me'))
//           .toPromise(),
//       ]);

//       this._userRights = (sessionData[0] as DataResponse<UserRights>).data;
//       this.userInfo = (sessionData[1] as DataResponse<AuthInfo>).data;
//       this.userImgUrl = await this.getMyImageUrl().catch(() => this.getUserImgPlaceholder());
//     } catch(ex) {
//       // window.location.href = this.getLoginUrl();
//       // FIXME
//       console.error("Error in session service:", ex);
//     }
//   }

//   get userRights(): Promise<UserRights> {
//     return Promise.resolve(this._userRights);
//   }

//   getSessionCookieContent(): AuthInfo | undefined {
//     try {
//       return jwtDecode(this.getSessionCookie());
//     } catch (ex) {
//       // FIXME
//       return {
//         id: '1234-124-454',
//         tenantId: '1234-124',
//         iat: 0,
//         name: 'Daniel Demo',
//         exp: 0,
//         preferredLanguage: 'de_DE',
//         isMultiTenantAdmin: false,
//         token: '124',
//         email: '',
//         rights: [],
//         tenants: [],
//       };
//     }

//   }

//   getSessionCookie(): string {
//     return this.cookieService.get(this.environment.sessionCookieName);
//   }

//   async getMe() {
//     const { data } = await lastValueFrom(
//       this.http.get<DataResponse<UserDto>>(urlJoin(this.environment.userServiceUrl, 'v1/users/user/me'))
//     );

//     return { ...data, imageId: data.image, };
//   }

//   async updateMe(dto: Partial<UserDto & { password?: string }>) {
//     const options: { setPassword?: boolean; password?: string } = {};
//     if (dto.password) {
//       options.setPassword = true;
//       options.password = dto.password;
//       delete dto.password;
//     }

//     const { data } = (await this.http
//       .put<DataResponse<UserDto>>(urlJoin(this.environment.userServiceUrl, 'v1/me'), {
//         ...dto,
//         options,
//       })
//       .toPromise()) as DataResponse<UserDto>;

//     this.userImgUrl = dto.image
//       ? urlJoin(this.environment.fileServiceUrl, 'v1/image', `${dto.image}?w=35&h=35`)
//       : this.getUserImgPlaceholder();

//     return data;
//   }

//   async changeMyPassword(password: string) {
//     const { data } = (await this.http
//       .post<DataResponse<boolean>>(`${this.environment.userServiceUrl}v1/me/change_password`, {
//         password,
//       })
//       .toPromise()) as DataResponse<boolean>;

//     if (!data) {
//       throw new Error('Password could not be changed');
//     }
//   }

//   getUserProfileLink() {
//     return urlJoin(this.environment.usersFrontendUrl, `#/users/${this.userInfo.id}`);
//   }

//   getLogoutUrl() {
//     return urlJoin(this.environment.userServiceUrl, 'v1/auth/logout');
//   }

//   getLoginUrl() {
//     return urlJoin(this.environment.userServiceUrl, 'v1/auth/login');
//   }

//   async getMyImageUrl(): Promise<string> {
//     try {
//       const user = await this.getMe();
//       if (user.imageId) {
//         return urlJoin(this.environment.fileServiceUrl, 'v1/image', `${user.imageId}?w=35&h=35`);
//       }
//     } catch (ex) {
//       this.logger.info(`Cannot load user image, using fallback ...`);
//     }
//     return this.getUserImgPlaceholder();
//   }

//   private getUserImgPlaceholder(): string {
//     let abbr = 'N/A';
//     try {
//       abbr = this.userInfo.name
//         .split(' ')
//         .map(p => p.trim())
//         .filter(p => !!p)
//         .map(p => p.charAt(0).toUpperCase())
//         .join('')
//         .trim();
//     } catch {}

//     return (
//       'data:image/svg+xml;base64,' +
//       btoa(
//         `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="128" height="128" viewBox="0 0 33.866666 33.866668" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs id="defs2" /><g id="layer1"><circle style="fill:#eeeeef;fill-opacity:1;stroke-width:1.4397" id="path880" cx="17" cy="17" r="17" /><text xml:space="preserve" style="font-style:normal;font-weight:normal;font-size:16.9333px;line-height:1.25;font-family:sans-serif;text-align:center;text-anchor:middle;fill:#6a6a6a;fill-opacity:1;stroke:none;stroke-width:0.264583" x="16.941601" y="23.089018" id="text1292"><tspan id="tspan1290" style="font-size:16.9333px;text-align:center;text-anchor:middle;stroke-width:0.264583;fill:#6a6a6a;fill-opacity:1" x="16.941601" y="23.089018">${abbr}</tspan></text></g></svg>`,
//       )
//     );
//   }
// }
