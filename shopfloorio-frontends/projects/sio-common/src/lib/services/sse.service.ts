import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SseService {
  constructor(private _zone: NgZone) {}

  getServerSentEvent<T>(url: string): Observable<T> {
    return new Observable(observer => {
      const eventSource = this.getEventSource(url);
      eventSource.onmessage = event => {
        let data = {};
        try {
          data = JSON.parse(event.data);
        } catch (ex) {
          console.error(`Cannot parse SSE JSON response!`, event);
          return;
        }

        this._zone.run(() => {
          observer.next(data as T);
        });
      };

      eventSource.onerror = error => {
        this._zone.run(() => {
          observer.error(error);
        });
      };

      return () => {
        eventSource.close();
      };
    });
  }

  private getEventSource(url: string): EventSource {
    return new EventSource(url);
  }
}
