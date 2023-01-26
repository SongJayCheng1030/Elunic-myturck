import { Module, Type } from '@nestjs/common';
import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common/interfaces';
import { maxHeaderSize } from 'http';
import { AbstractConfigService } from 'shared/backend/config';

import { StatusController } from './controllers/status.controller';
import { CoreMiddlewareInjectorService } from './core/core-middleware-injector.service';
import {
  INJECT_AUTH_MIDDLEWARE_ALLOW_NO_TENANTS,
  INJECT_TENANT_MIGRATION_LIST,
  INJECT_TENANT_MIGRATION_TABLE_PREFIX,
} from './defines';
import { TenantMigration } from './models';
import { PromMetricsService } from './services/prom-metrics.service';
import { SharedApiService } from './services/shared-api.service';
import { SharedAssetService } from './services/shared-asset.service';
import { SharedConfigService } from './services/shared-config.service';
import { SharedFileService } from './services/shared-file.service';

console.debug(`HTTP_MAX_HEADER_SIZE=${maxHeaderSize}`);

@Module({})
export class LibModule {
  static forRootAsync(options: LibModuleAsyncOptions): DynamicModule {
    // The caching ensures we don't call the useFactory() function in the options more than necessary
    let cachedModuleOptions: LibModuleOptions;
    async function useFactoryCached(...args: unknown[]): Promise<LibModuleOptions> {
      if (!cachedModuleOptions) {
        cachedModuleOptions = await options.useFactory(...args);
      }

      return cachedModuleOptions;
    }

    const providers: Provider[] = [
      {
        provide: AbstractConfigService,
        useFactory: async (...args: unknown[]): Promise<AbstractConfigService> =>
          (await useFactoryCached(...args)).configService,
        inject: options.inject || [],
      },
      SharedFileService,
      SharedConfigService,
      SharedApiService,
      SharedAssetService,

      {
        provide: INJECT_AUTH_MIDDLEWARE_ALLOW_NO_TENANTS,
        useValue: options.authMiddlewareAllowNoTenants || [],
      },

      // Provide all given tenant migrations, if any
      {
        provide: INJECT_TENANT_MIGRATION_LIST,
        useFactory: (...args: unknown[]) => {
          return args;
        },
        inject: (options.tenantMigrations || []) as any,
      },
      // Provide the table prefix
      {
        provide: INJECT_TENANT_MIGRATION_TABLE_PREFIX,
        useValue: options.tenantMigrationPrefix || ('' as string),
      },
    ];

    return {
      module: LibModule,
      global: true,
      controllers: [...(options.enablePrometheus === true ? [StatusController] : [])],
      imports: [...(options.imports || [])],
      providers: [
        ...providers,
        ...(options.disableTenantMiddleware ? [] : [CoreMiddlewareInjectorService]),
        ...(options.enablePrometheus === true ? [PromMetricsService] : []),
      ],
      exports: providers,
    };
  }
}

interface LibModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<LibModuleOptions> | LibModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
  enablePrometheus?: boolean;
  tenantMigrations?: Array<Type<TenantMigration>>;
  tenantMigrationPrefix?: string;
  authMiddlewareAllowNoTenants?: string[];
  disableTenantMiddleware?: boolean;
}

export interface LibModuleOptions {
  configService: AbstractConfigService;
}
