import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

import { getCurrentServiceRequestStats } from '../middlewares/statMiddleware';

@Injectable()
export class PromMetricsService {
  private startedAt: number = Date.now();

  private processResidentMemoryBytes!: client.Gauge<string>;
  private http2xxCodes!: client.Gauge<string>;
  private http3xxCodes!: client.Gauge<string>;
  private http4xxCodes!: client.Gauge<string>;
  private http5xxCodes!: client.Gauge<string>;
  private uptime!: client.Gauge<string>;
  private hasRequestMetrics!: client.Gauge<string>;
  private totalRequests!: client.Gauge<string>;
  private reqTimeAvg!: client.Gauge<string>;
  private reqTimeMin!: client.Gauge<string>;
  private reqTimeMax!: client.Gauge<string>;

  private origin: string;
  private currentRssBytes = 0;

  constructor() {
    this.origin = `${process.env.npm_package_name}_v${process.env.npm_package_version}`;
    if (this.origin.length < 10) {
      this.origin = `unkown-service_v0.0.0`;
    }

    this.init();
    setInterval(this.collect.bind(this), 5000);
    this.collect();
  }

  private init() {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    const Registry = client.Registry;
    const register = new Registry();
    collectDefaultMetrics({ register });

    // Define metrics
    this.processResidentMemoryBytes = new client.Gauge({
      name: 'node_resident_memory_bytes',
      help: 'Resident memory size in bytes used by the node process.',
      labelNames: ['origin'],
    });

    this.http2xxCodes = new client.Gauge({
      name: 'total_http_2xx_codes',
      help: 'Total number of 2xx status codes (success) returned by the service.',
      labelNames: ['origin'],
    });

    this.http3xxCodes = new client.Gauge({
      name: 'total_http_3xx_codes',
      help: 'Total number of 3xx status codes (redirects) returned by the service.',
      labelNames: ['origin'],
    });

    this.http4xxCodes = new client.Gauge({
      name: 'total_http_4xx_codes',
      help: 'Total number of 4xx status codes (client errors) returned by the service.',
      labelNames: ['origin'],
    });

    this.http5xxCodes = new client.Gauge({
      name: 'total_http_5xx_codes',
      help: 'Total number of 5xx status codes returned by the service. These are possible bugs.',
      labelNames: ['path', 'statusCode', 'method', 'origin'],
    });
    this.http5xxCodes.set({}, 0);

    this.hasRequestMetrics = new client.Gauge({
      name: 'has_request_metrics_enabled',
      help: 'Indicates if the "extended" request metrics are enabled and collected (statMiddleware included).',
      labelNames: ['origin'],
    });

    this.uptime = new client.Gauge({
      name: 'total_uptime',
      help: 'Total uptime of the service in milliseconds.',
      labelNames: ['origin'],
    });

    this.totalRequests = new client.Gauge({
      name: 'total_request_count',
      help: 'Total number of requests served by this service.',
      labelNames: ['origin'],
    });

    this.reqTimeAvg = new client.Gauge({
      name: 'request_time_avg',
      help: 'Average request processing time in milliseconds.',
      labelNames: ['origin'],
    });

    this.reqTimeMax = new client.Gauge({
      name: 'request_time_max',
      help: 'Request processing time of the longest request seen so far in milliseconds.',
      labelNames: ['origin'],
    });

    this.reqTimeMin = new client.Gauge({
      name: 'request_time_min',
      help: 'Request processing time of the shortest request seen so far in milliseconds.',
      labelNames: ['origin'],
    });
  }

  private collect() {
    // Overall memory usage
    const memoryUsage = process.memoryUsage();
    this.processResidentMemoryBytes.set({ origin: this.origin }, memoryUsage.rss);
    this.currentRssBytes = memoryUsage.rss;

    // Other service-related stats
    const stats = getCurrentServiceRequestStats();
    if (stats) {
      this.hasRequestMetrics.set({ origin: this.origin }, 1);

      this.http2xxCodes.set({ origin: this.origin }, stats.total2xxStatusCount);
      this.http3xxCodes.set({ origin: this.origin }, stats.total3xxStatusCount);
      this.http4xxCodes.set({ origin: this.origin }, stats.total4xxStatusCount);
      this.http5xxCodes.set({ origin: this.origin }, stats.total5xxStatusCount);
      this.totalRequests.set({ origin: this.origin }, stats.totalRequests);
      this.reqTimeAvg.set({ origin: this.origin }, stats.requestTimeAvg);
      this.reqTimeMin.set({ origin: this.origin }, stats.requestTimeMin);
      this.reqTimeMax.set({ origin: this.origin }, stats.requestTimeMax);

      for (const key in stats.details5xxRoutes) {
        const entry = stats.details5xxRoutes[key];
        this.http5xxCodes.set(
          {
            origin: this.origin,
            path: entry.path,
            method: entry.method,
            statusCode: entry.statusCode,
          },
          entry.count,
        );
      }
    } else {
      this.hasRequestMetrics.set({ origin: this.origin }, 0);
    }

    // How long the service runs
    this.uptime.set({ origin: this.origin }, Date.now() - this.startedAt);
  }

  getServiceName(): string {
    return `${process.env.npm_package_name || 'unkown-service'}`;
  }

  getServiceVersion(): string {
    return `${process.env.npm_package_version || '0.0.0'}`;
  }

  getCurrentRssMb(): string {
    return `${Math.round((this.currentRssBytes / 1048576) * 100) / 100} MB`;
  }

  getUptimeSecs(): string {
    return `${Math.floor((Date.now() - this.startedAt) / 1000)}`;
  }

  async getMetrics() {
    return client.register.metrics();
  }

  getMetricsContentType() {
    return client.register.contentType;
  }
}
