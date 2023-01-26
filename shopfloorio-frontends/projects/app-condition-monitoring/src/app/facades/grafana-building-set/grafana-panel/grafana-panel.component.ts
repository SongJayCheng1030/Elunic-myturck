import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Logger, TileProperty, TileVariable } from '@sio/common';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, skip } from 'rxjs/operators';

import { TimebrokerService } from '../services/timebroker.service';

export interface GrafanaChart {
  id: string;
  dashboardAlias: string;
  orgId: number;
  panelId: number;
}

export interface GrafanaClickEvent {
  vars: TileVariable[];
  tile?: TileProperty;
}

export interface TimeRange {
  from: string;
  to: string;
}

type GrafanaApp = Window & {
  angular: {
    element: (element: string) => {
      injector: () => {
        get: (name: string) => {
          setTime: (range: TimeRange) => {};
        };
      };
    };
  };
};

@Component({
  selector: 'app-grafana-panel',
  templateUrl: './grafana-panel.component.html',
  styleUrls: ['./grafana-panel.component.scss'],
})
export class GrafanaPanelComponent implements AfterViewInit, OnDestroy {
  private logger = new Logger('GrafanaPanelComponent');

  private initialized = false;

  @Input() chart!: GrafanaChart;

  @Input() deviceId!: string;

  @ViewChild('grafanaframe', { static: false }) grafanaFrame!: ElementRef<HTMLIFrameElement>;

  @Input() adminView?: boolean;
  @Input() property?: TileProperty;
  @Input() totalTiles = 1;
  @Output() action = new EventEmitter<any>();
  @Output() onLinkClick = new EventEmitter<GrafanaClickEvent>();

  private subs!: Subscription;

  private gfTimeSelSubject = new Subject();

  constructor(private readonly timebroker: TimebrokerService, private ngZone: NgZone) {
    this.gfTimeSelSubject
      .pipe(
        // We don't need the first one, because this is the initial
        // time "selection"
        skip(1),
        distinctUntilChanged((x: any, y: any) => JSON.stringify(x) === JSON.stringify(y)),
      )
      .subscribe((a: any) => {
        timebroker.setFromTo(a.from, a.to);
      });
  }

  onAction(mode: string) {
    this.action.emit({ mode, id: this.property?.id });
  }

  ngOnDestroy() {
    this.subs && this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs = this.timebroker.timeRange$.subscribe(timeRange => {
      if (this.initialized) {
        this.logger.info(`Timerange changed:`, timeRange);
        this.setNewTimeRange(timeRange, this.grafanaFrame.nativeElement);
        return;
      }

      const url = this.getUrl(timeRange);
      this.grafanaFrame.nativeElement.src = url;
      this.initialized = true;
      this.logger.info(`Set tile URL=`, url);

      // If the iframe is created
      if (this.grafanaFrame.nativeElement.contentWindow) {
        const _that = this;

        // ... and loaded, we inject our detector function
        this.grafanaFrame.nativeElement.onload = function () {
          const contentWindow = _that.grafanaFrame.nativeElement.contentWindow!;
          contentWindow.document.body.addEventListener(
            'click',
            evt => _that.onGrafanaClick(evt),
            true,
          );

          // @ts-ignore
          const old = _that.grafanaFrame.nativeElement.contentWindow.fetch;

          // @ts-ignore
          _that.grafanaFrame.nativeElement.contentWindow.console.error = (...args) => {
            _that.logger.info(`Error inside Grafana:`, ...args);
          };

          // @ts-ignore
          _that.grafanaFrame.nativeElement.contentWindow.fetch = function () {
            const payload = arguments[1] as any;

            if (`${arguments[0]}`.indexOf('query') > -1 && payload && payload.method === 'POST') {
              try {
                const ret = JSON.parse(payload.body);
                if (ret.range && ret.range.from && ret.range.to) {
                  _that.ngZone.run(() => {
                    _that.gfTimeSelSubject.next({
                      from: new Date(ret.range.from),
                      to: new Date(ret.range.to),
                    });
                  });
                }
              } catch (ex) {
                _that.logger.error(`Cannot update time range:`, ex);
              }
            }

            // @ts-ignore
            return old.apply(null, arguments);
          };
        };
      }
    });
  }

  private onGrafanaClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a') {
      const anchor = target as HTMLAnchorElement;
      if (anchor.href.includes('var-')) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        const url = new URL(anchor.href);
        const vars: TileVariable[] = this.getGrafanaVariablesFromUrl(url);

        this.onLinkClick.emit({ vars, tile: this.property });
      }
    }
  }

  setGrafanaVariables(vars: TileVariable[]) {
    const url = new URL(this.grafanaFrame.nativeElement.src);
    const currentVars: string[] = [];

    url.searchParams.forEach((_, k) => {
      if (k.startsWith('var-')) currentVars.push(k);
    });

    for (const v of currentVars) url.searchParams.delete(v);
    for (const v of vars) url.searchParams.append(v.key, v.value);

    if (this.grafanaFrame.nativeElement.src !== url.href)
      this.grafanaFrame.nativeElement.src = url.href;
  }

  private getGrafanaVariablesFromUrl(url: URL): TileVariable[] {
    const vars: TileVariable[] = [];
    url.searchParams.forEach((v, k) => {
      if (k.startsWith('var-')) vars.push({ key: k, value: v });
    });
    return vars;
  }

  private getUrl(timeRange?: TimeRange): string {
    if (!this.property) {
      return '';
    }

    const url = new URL(this.property.gfEmbed.url, window.location.origin);

    // Grafana URL only supports UNIX timestamps (in ms) or symbolic values (like 'now')
    const _grafanafyDateVal = (inputDate: string): string => {
      const raw = inputDate || '';
      if (raw.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}/)) {
        return `${new Date(raw).getTime()}`;
      }
      return inputDate;
    };

    url.searchParams.append('var-deviceId', this.deviceId);

    for (const param of this.property.gfEmbed.params) {
      switch (param.type) {
        case 'const':
          url.searchParams.append(param.name, `${param.defaultValue}`);
          break;

        case 'refresh':
          url.searchParams.append(param.name, `${param.defaultValue}`);
          break;

        case 'timeFrom':
          url.searchParams.append(param.name, _grafanafyDateVal(`${timeRange?.from}`));
          break;

        case 'timeTo':
          url.searchParams.append(param.name, _grafanafyDateVal(`${timeRange?.to}`));
          break;

        case 'var':
          // Use the defaultValue as the value since this is generated
          // by the server and contains the translated field
          url.searchParams.append(param.name, param.defaultValue as string);
          break;

        default:
          break;
      }
    }

    return url.href;
  }

  private setNewTimeRange(timeRange: TimeRange, ele: HTMLIFrameElement) {
    const grafanaFrameWindow = ele.contentWindow as GrafanaApp;
    const grafana = grafanaFrameWindow.angular.element('grafana-app').injector().get('timeSrv');
    grafana.setTime(timeRange);
  }

  get isValid(): boolean {
    return Boolean(this.property?.gfDashboardId && this.property.gfEmbed.url);
  }
}
