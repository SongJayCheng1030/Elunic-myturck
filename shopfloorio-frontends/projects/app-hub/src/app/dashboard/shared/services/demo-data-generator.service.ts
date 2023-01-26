import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  updatedAt: string;
  ownerId: string;
  status: boolean;
  url: string;
}
@Injectable({
  providedIn: 'root',
})
export class DemoDataGeneratorService {
  constructor(private http: HttpClient) {}

  getEndpointUrl(): string {
    return new URL('/service/demo-data/', window.location.origin).href;
  }

  initDemoData() {
    this.http
      .get<string>(this.getEndpointUrl())
      .pipe(catchError(() => of('DEMO DATA BACKEND NOT AVAILABLE')))
      .subscribe();
  }
}
