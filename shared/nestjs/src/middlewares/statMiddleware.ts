import { INestApplication } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { createHash } from 'crypto';
import { Express, NextFunction, Request, Response } from 'express';
import { IncomingMessage, OutgoingMessage } from 'http';
import * as onFinished from 'on-finished';

/**
 * Requests that take longer to execute than this are logged
 */
const REQUEST_TIME_LOG_THRESHOLD = 14000;

function shortHash(data: string): string {
  return createHash('md5').update(data).digest('hex').substring(0, 14);
}

export interface ServiceRequestStats {
  requestTimeAvg: number;
  requestTimeMin: number;
  requestTimeMax: number;
  totalRequests: number;
  total2xxStatusCount: number;
  total3xxStatusCount: number;
  total4xxStatusCount: number;
  total5xxStatusCount: number;
  totalRequestTime: number;
  details5xxRoutes: {
    [key: string]: {
      method: string;
      statusCode: number;
      path: string;
      count: number;
    };
  };
}

export function getCurrentServiceRequestStats(): ServiceRequestStats | null {
  const typedGlobal = global as { [key: string]: any };
  if (typeof typedGlobal['serviceRequestStats'] === 'undefined') {
    return null;
  }
  return typedGlobal['serviceRequestStats'] as ServiceRequestStats;
}

function getCollector(): ServiceRequestStats {
  const typedGlobal = global as { [key: string]: any };
  if (typeof typedGlobal['serviceRequestStats'] === 'undefined') {
    typedGlobal['serviceRequestStats'] = {
      requestTimeAvg: 0,
      requestTimeMin: 0,
      requestTimeMax: 0,
      totalRequests: 0,
      total2xxStatusCount: 0,
      total3xxStatusCount: 0,
      total4xxStatusCount: 0,
      total5xxStatusCount: 0,
      totalRequestTime: 0,
      details5xxRoutes: {},
    } as ServiceRequestStats;
  }
  return typedGlobal['serviceRequestStats'] as ServiceRequestStats;
}

function isAlreadyInstalled(): boolean {
  // @ts-ignore
  if (global['stat_middleware__already'] === true) {
    return true;
  }
  // @ts-ignore
  global['stat_middleware__already'] = true;
  return false;
}

/**
 * @deprecated Include the lib module instead
 */
export default function statMiddleware(app: INestApplication): void {
  // Get the express app
  const adapterHost = app.get(HttpAdapterHost);
  const httpAdapter = adapterHost.httpAdapter;
  const instance = httpAdapter.getInstance();

  const expressApp: Express = <Express>instance;
  return statMiddlewareExpress(expressApp);
}

export function statMiddlewareExpress(expressApp: Express): void {
  if (isAlreadyInstalled()) {
    console.debug(
      `statMiddleware() already installed! Remove statMiddleware(...); from 'index.ts'`,
    );
    return;
  }

  // Add the middlewares
  expressApp.use(StatMiddleware);

  async function StatMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const data = getCollector();

    onFinished<IncomingMessage | OutgoingMessage>(
      res as OutgoingMessage,
      (_: Error | null, res: any) => {
        const requestTime = Date.now() - startTime;

        // Update general metrics
        data.totalRequestTime += requestTime;
        data.totalRequests++;

        // Calculate simple metrics
        data.requestTimeAvg = data.totalRequestTime / data.totalRequests;
        if (data.requestTimeMin === 0 || requestTime < data.requestTimeMin) {
          data.requestTimeMin = requestTime;
        }
        if (data.requestTimeMax === 0 || requestTime > data.requestTimeMax) {
          data.requestTimeMax = requestTime;
        }

        // For debugging purposes
        if (requestTime > REQUEST_TIME_LOG_THRESHOLD) {
          console.error(
            `[Long request] ${req.method} ${req.url} = HTTP ${res.statusCode}, dur ${requestTime}`,
          );
        }

        // Log the status codes
        if (200 <= res.statusCode && res.statusCode < 300) {
          data.total2xxStatusCount++;
        } else if (300 <= res.statusCode && res.statusCode < 400) {
          data.total3xxStatusCount++;
        } else if (400 <= res.statusCode && res.statusCode < 500) {
          data.total4xxStatusCount++;
        } else if (500 <= res.statusCode && res.statusCode < 600) {
          data.total5xxStatusCount++;

          // Collect extended infos
          const infoHash = shortHash([req.url, req.method, res.statusCode].join(':'));
          if (typeof data.details5xxRoutes[infoHash] !== 'object') {
            data.details5xxRoutes[infoHash] = {
              count: 0,
              method: req.method,
              path: req.url,
              statusCode: res.statusCode,
            };
          }
          data.details5xxRoutes[infoHash].count++;
        }
      },
    );

    next();
  }
}
