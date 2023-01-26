import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetTreeNodeDto, AssetTypeDto } from 'shared/common/models';

import { SseService } from './sse.service';

export interface EquipmentOeeOverviewDto {
  [kpi: string]: EquipmentKpiOverviewDto;
}
export interface EquipmentKpiOverviewDto {
  HIGH: EquipmentOeeOverviewDataDto;
  LOW: EquipmentOeeOverviewDataDto;
  UNDEFINED: EquipmentOeeOverviewDataDto;
}

export interface EquipmentOeeOverviewDataDto {
  count: number;
  percent: number;
  total: number;
  type: 'UNDEFINED' | 'LOW' | 'HIGH';
}

export interface EquipmentPerfData {
  oee: number;
  yield: number;
  availability: number;
  utilization: number;
}

export interface EquipmentStatusData {
  status: string;
  color: string;
}

export interface EquipmentStatus {
  perf: {
    [key: string]: EquipmentPerfData;
  };
  status: {
    [key: string]: EquipmentStatusData;
  };
}

export interface StatusOverviewItemDto {
  abs: number; // Absolute count
  rel: number; // Fraction, relative number
  color: string; // Color string;
}

export interface StatusOverviewDto {
  /**
   * For every status type
   */
  [key: string]: StatusOverviewItemDto;
}
export interface PerformanceDataDto {
  /**
   * For every equipment by id
   */
  [key: string]: EqPerformanceDataDto[];
}
export interface EqPerformanceDataDto {
  x: string;
  y: number;
}

export interface SseResponse<T> {
  e: string;
  data: T;
  meta: unknown;
}
export enum EquipmentKpiTypes {
  OEE = 'OEE',
  YIELD = 'YIELD',
  AVAILABILITY = 'AVAILABILITY',
  UTILIZATION = 'UTILIZATION',
}
@Injectable({
  providedIn: 'root',
})
export class InsightDataKpiService {
  private sseSubs: Subscription[] = [];
  private selectedKpiSubject = new BehaviorSubject<EquipmentKpiTypes>(EquipmentKpiTypes.OEE);

  private equipmentStatusSubject = new Subject<EquipmentStatus>();
  private equipmentStatusOverviewSubject = new BehaviorSubject<StatusOverviewDto>({});
  private equipmentOEEOverviewSubject = new Subject<EquipmentOeeOverviewDto>();
  private throughput24hSubject = new Subject<PerformanceDataDto>();

  constructor(private readonly sseService: SseService, private readonly httpClient: HttpClient) {}

  private createUrl(path: string, query?: { [key: string]: any }) {
    const url = new URL(path, window.location.origin);
    query &&
      Object.keys(query).forEach(k => {
        if (query[k]) url.searchParams.append(k, query[k]);
      });
    return url.href;
  }

  private getEquipmentStatusUrl(query?: { [key: string]: any }): string {
    return this.createUrl(
      '/service/condition-monitoring/v1/insight-data/equipment-status/stream',
      query,
    );
  }

  private getEquipmentStatusOverviewUrl(query?: { [key: string]: any }): string {
    return this.createUrl(
      '/service/condition-monitoring/v1/insight-data/equipment-status-overview/stream',
      query,
    );
  }

  private getEquipmentOEEOverviewUrl(query?: { [key: string]: any }): string {
    return this.createUrl(
      '/service/condition-monitoring/v1/insight-data/equipment-oee-overview/stream',
      query,
    );
  }

  private getThroughput24hUrl(query?: { [key: string]: any }): string {
    return this.createUrl('/service/condition-monitoring/v1/insight-data/throughput/stream', query);
  }

  private sseOverviewStatusMock(): Observable<SseResponse<StatusOverviewDto>> {
    return this.httpClient
      .get<StatusOverviewDto>('assets/mocks/asset-mocks/overview-status.json')
      .pipe(
        map<StatusOverviewDto, SseResponse<StatusOverviewDto>>(data => {
          return {
            data,
            e: 'data',
            meta: undefined,
          };
        }),
      );
  }

  private sseOverviewOEEMock(): Observable<SseResponse<EquipmentOeeOverviewDto>> {
    return this.httpClient
      .get<EquipmentOeeOverviewDto>('assets/mocks/asset-mocks/overview-oee.json')
      .pipe(
        map<EquipmentOeeOverviewDto, SseResponse<EquipmentOeeOverviewDto>>(data => {
          return {
            data,
            e: 'data',
            meta: undefined,
          };
        }),
      );
  }

  private sseEquipmentStatusMock(): Observable<SseResponse<EquipmentStatus>> {
    return this.httpClient
      .get<EquipmentStatus>('assets/mocks/asset-mocks/equipment-status.json')
      .pipe(
        map<EquipmentStatus, SseResponse<EquipmentStatus>>(data => {
          data = this.randomizeEquipmentStatus(data);

          return {
            data,
            e: 'data',
            meta: undefined,
          };
        }),
      );
  }

  private randomizeEquipmentStatus(status: EquipmentStatus): EquipmentStatus {
    const states = [
      { status: 'IDLE', color: '#ffdf00' },
      { status: 'RUN', color: '#00bf01' },
      { status: 'ALARM', color: '#ff3e00' },
    ];

    const ids = Object.keys(status.perf);
    for (const id of ids) {
      status.perf[id].oee = Math.random();
      status.perf[id].availability = Math.random();
      status.perf[id].utilization = Math.random();
      status.perf[id].yield = Math.random();
      status.status[id] = states[Math.floor(Math.random() * states.length)];
    }

    return status;
  }

  private randomizePerformanceData(data: PerformanceDataDto): PerformanceDataDto {
    const ids = Object.keys(data);
    for (const id of ids) {
      for (let i = 0; i < 24; i++) {
        data[id].push({ x: i.toString(), y: Math.random() });
      }
    }

    return data;
  }

  private sseThroughput24hMock(): Observable<SseResponse<PerformanceDataDto>> {
    return this.httpClient
      .get<PerformanceDataDto>('assets/mocks/asset-mocks/performance-data.json')
      .pipe(
        map<PerformanceDataDto, SseResponse<PerformanceDataDto>>(data => {
          data = this.randomizePerformanceData(data);

          return {
            data,
            e: 'data',
            meta: undefined,
          };
        }),
      );
  }

  private equipmentDetailMock(from: string, to: string): Observable<any> {
    return this.httpClient.get<any>('assets/mocks/asset-mocks/equipment-detail.json').pipe(
      map(data => {
        let fromDate = new Date(from);
        const toDate = new Date(to);

        const diff = Math.abs(toDate.getTime() - fromDate.getTime());
        const diffDays = diff / (1000 * 60 * 60 * 24);

        if (diffDays <= 1) {
          data.aggrMode = 'hourly';
        }

        while (fromDate <= toDate) {
          const time = fromDate.toISOString();

          let random = Math.random();
          (data.oeeDaily as any[]).push({
            x: time,
            y: random,
            tag: random < 0.85 ? 'low' : 'high',
          });

          (data.oeeDailyTrend as any[]).push({
            x: time,
            y: random,
          });

          random = Math.random();
          (data.throughputDaily as any[]).push({
            x: time,
            y: random,
            tag: random < 0.85 ? 'low' : 'high',
          });

          (data.throughputDailyTrend as any[]).push({
            x: time,
            y: random,
          });

          random = Math.random();
          (data.equipmentStatusHistory as any[]).push({
            x: time,
            productive: random,
            scheduled: (1 - random) / 3,
            standby: (1 - random) / 3,
            unscheduled: (1 - random) / 3,
          });

          data.kpi = {
            oee: Math.random(),
            yield: Math.random(),
            utilization: Math.random(),
            availability: Math.random(),
            unscheduled: Math.random(),
          };

          const current = Math.floor(Math.random() * 10 + 1) - 1;
          const last = Math.floor(Math.random() * 10 + 1) - 1;

          data.throughput = {
            current,
            last,
            trend: current - last,
            trendDirection: current - last > 0 ? 0 : -1,
          };

          if (diffDays <= 1) {
            const nextDate = fromDate.setHours(fromDate.getHours() + 1);
            fromDate = new Date(nextDate);
          } else {
            const nextDate = fromDate.setDate(fromDate.getDate() + 1);
            fromDate = new Date(nextDate);
          }
        }

        return { data };
      }),
    );
  }

  private initOverviewStream(ids: string[]) {
    this.sseSubs.push(
      this.sseEquipmentStatusMock().subscribe(resp => {
        if (resp.e === 'data') {
          this.equipmentStatusSubject.next(resp.data);
        }
      }),
    );

    this.sseSubs.push(
      this.sseOverviewStatusMock().subscribe(resp => {
        if (resp.e === 'data') {
          this.equipmentStatusOverviewSubject.next(resp.data);
        }
      }),
    );

    this.sseSubs.push(
      this.sseOverviewOEEMock().subscribe(resp => {
        if (resp.e === 'data') {
          this.equipmentOEEOverviewSubject.next(resp.data);
        }
      }),
    );
    this.sseSubs.push(
      this.sseThroughput24hMock().subscribe(resp => {
        if (resp.e === 'data') {
          this.throughput24hSubject.next(resp.data);
        }
      }),
    );
  }

  initOverview(ids: string[], from: string, to: string) {
    this.sseSubs.push(
      this.sseOverviewStatusMock().subscribe(resp => {
        if (resp.e === 'data') {
          this.equipmentStatusOverviewSubject.next(resp.data);
        }
      }),
    );

    this.sseEquipmentStatusMock().subscribe(resp => {
      this.equipmentStatusSubject.next(resp.data);
    });

    this.sseOverviewOEEMock().subscribe(resp => {
      this.equipmentOEEOverviewSubject.next(resp.data);
    });

    this.sseThroughput24hMock().subscribe(resp => {
      this.throughput24hSubject.next(resp.data);
    });
  }

  initOverviewByNode(node: AssetTreeNodeDto, from: string, to: string) {
    // unsubscribe existing subscriptions
    this.sseSubs.forEach(s => s.unsubscribe());
    this.sseSubs = [];

    // if no node requested, thats it
    if (!node) {
      return;
    }

    // get all relevant IDs (check where we are in the tree)
    let ids = this.findCMAssetIds(node);
    if (!ids || !ids.length) ids = [node.id];

    // if from === to, we are live and subscribe the stream, else we get a fixed timeframe once
    if (from === to) {
      this.initOverviewStream(ids);
    } else {
      this.initOverview(ids, from, to);
    }
  }

  getEquipmentDetails(id: string, from: string, to: string) {
    return this.equipmentDetailMock(from, to).pipe(map(r => (r as any).data));
  }

  get equipments$(): Observable<string[]> {
    return this.equipmentStatusSubject
      .asObservable()
      .pipe(map(v => (v && Object.keys(v.perf)) || []));
  }

  getEquipmentStatusOverview(): Observable<StatusOverviewDto> {
    return this.equipmentStatusOverviewSubject.asObservable();
  }
  getEquipmentOEEOverview(): Observable<EquipmentOeeOverviewDto> {
    return this.equipmentOEEOverviewSubject.asObservable();
  }
  getPerfDataByEquipment(equipmentId: string): Observable<EquipmentPerfData> {
    // return this.equipmentStatusSubject.asObservable().pipe(map(v => v.perf[equipmentId]));
    return this.equipmentStatusSubject
      .asObservable()
      .pipe(map(v => this.randomizeEquipmentStatus(v).perf['mock']));
  }
  getStatusDataByEquipment(equipmentId: string): Observable<EquipmentStatusData> {
    // return this.equipmentStatusSubject.asObservable().pipe(map(v => v.status[equipmentId]));
    return this.equipmentStatusSubject
      .asObservable()
      .pipe(map(v => this.randomizeEquipmentStatus(v).status['mock']));
  }
  getThroughput24hByEquipment(equipmentId: string): Observable<EqPerformanceDataDto[]> {
    // return this.throughput24hSubject.asObservable().pipe(map(v => v[equipmentId]));
    return this.throughput24hSubject
      .asObservable()
      .pipe(map(v => this.randomizePerformanceData(v)['mock']));
  }

  getSelectedKpiSubject() {
    return this.selectedKpiSubject;
  }

  private hasType = (a: AssetTreeNodeDto, type: string) =>
    a.assetType &&
    a.assetType.name &&
    Object.keys(a.assetType.name).some(k =>
      (a.assetType as AssetTypeDto).name[k].toLowerCase().includes(type.toLowerCase()),
    );

  isCMAsset(node: AssetTreeNodeDto) {
    return this.hasType(node, 'CM Equipment') || this.hasType(node, 'CM Conversion Kit');
  }
  findCMAssets(node: AssetTreeNodeDto) {
    let equipmentAssets: AssetTreeNodeDto[] = [];
    let conversionAssets: AssetTreeNodeDto[] = [];

    const findall = (node: AssetTreeNodeDto) => {
      if (node.children && node.children.length) {
        const eqs = node.children.filter(a => this.hasType(a, 'CM Equipment'));
        const convs = node.children.filter(a => this.hasType(a, 'CM Conversion Kit'));
        equipmentAssets = equipmentAssets.concat(eqs);
        conversionAssets = conversionAssets.concat(convs);
        node.children.forEach(c => findall(c));
      }
    };

    findall(node);
    if (this.hasType(node, 'CM Equipment')) equipmentAssets.push(node);
    if (this.hasType(node, 'CM Conversion Kit')) conversionAssets.push(node);

    return { equipmentAssets, conversionAssets };
  }

  findCMAssetIds(node: AssetTreeNodeDto) {
    const assets = this.findCMAssets(node);
    return [...assets.equipmentAssets.map(e => e.id), ...assets.conversionAssets.map(c => c.id)];
  }
}
