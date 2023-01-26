import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectConnection } from '@nestjs/typeorm';
import { Express, NextFunction, Request, Response } from 'express';
import * as NodeCache from 'node-cache';
import { AuthInfo } from 'shared/common/types';
import { Connection } from 'typeorm';

import { authMiddlewareExpress } from '../auth';
import {
  INJECT_AUTH_MIDDLEWARE_ALLOW_NO_TENANTS,
  INJECT_TENANT_MIGRATION_LIST,
  INJECT_TENANT_MIGRATION_TABLE_PREFIX,
} from '../defines';
import { statMiddlewareExpress } from '../middlewares/statMiddleware';
import { TenantMigration } from '../models';
import { Mutex } from '../util/mutex';

@Injectable()
export class CoreMiddlewareInjectorService {
  private mutex: Mutex = new Mutex();

  private tenantMigrationsEnabled = false;

  private migrationTableName = '';

  private registeredMigrations: Array<{ computedName: string; migration: TenantMigration }> = [];

  private cache: NodeCache = new NodeCache({ stdTTL: 0 });

  constructor(
    httpAdapter: HttpAdapterHost,
    @InjectConnection()
    private conn: Connection,
    @Inject(INJECT_TENANT_MIGRATION_LIST)
    private readonly migrations: TenantMigration[],
    @Inject(INJECT_TENANT_MIGRATION_TABLE_PREFIX)
    private readonly tablePrefix: string | undefined | null,
    @InjectLogger('CoreMiddlewareInjectorService')
    private logger: Logger,
    @Inject(INJECT_AUTH_MIDDLEWARE_ALLOW_NO_TENANTS)
    private readonly allowNoTenants: string[] | undefined,
  ) {
    // First: add express listeners
    this.addExpressListeners(httpAdapter.httpAdapter.getInstance() as Express);

    this.tenantMigrationsEnabled = Array.isArray(migrations) && !!tablePrefix;
    if (this.tenantMigrationsEnabled) {
      this.logger.info(`Tenant migrations ENABLED`);
      this.migrationTableName = `${this.tablePrefix || 'sio'}__tenant_migrations`;
    } else {
      if (!Array.isArray(migrations)) {
        this.logger.info(`Tenant migrations DISABLED: no tenant migrations listed`);
      } else {
        this.logger.warn(
          `Tenant migrations DISABLED. Reason: you are missing the table prefix argument!`,
        );
      }
    }

    // Initialize everything
    this.init()
      .then(() => {
        this.logger.info(`Setup successfull`);
      })
      .catch(err => {
        this.logger.error('Fatal error: cannot setup http middlewares properly:', err);
        process.exit(1);
      });
  }

  private addExpressListeners(expressApp: Express) {
    // The auth middleware always comes first
    authMiddlewareExpress(expressApp, this.allowNoTenants || []);
    statMiddlewareExpress(expressApp);

    // Add the tenant migration handler
    expressApp.use((req: Request, _: Response, next: NextFunction) => {
      this.newTenantInterceptor(req.auth)
        .then(() => {
          this.mutex.release(req?.auth?.tenantId);
          next();
        })
        .catch(err => {
          this.logger.error(
            `Failed to perform migration for new tenantId: ${req?.auth?.tenantId || 'N/A'}`,
            err,
          );
          this.mutex.release(req?.auth?.tenantId);
          next(err);
        });
    });
  }

  private async init() {
    // Create the migration table
    await this.setupTenantMigrationTable();
    await this.prepareTenantMigrations();
  }

  private async setupTenantMigrationTable() {
    if (!this.tenantMigrationsEnabled) {
      return;
    }

    if (!this.conn) {
      this.logger.error(`Cannot create tenant migration table: connection to DB is not present`);
      return;
    }

    // Ensure the table is there
    await this.conn.query(`
      CREATE TABLE IF NOT EXISTS \`${this.migrationTableName}\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`tenant_id\` char(36) NOT NULL DEFAULT '',
        \`name\` char(60) NOT NULL DEFAULT '',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_tenant-id-name_${Math.random()
          .toString(32)
          .substring(2)}\` (\`tenant_id\`,\`name\`)
      ) ENGINE=InnoDB;
    `);
  }

  private async prepareTenantMigrations() {
    if (!this.tenantMigrationsEnabled) {
      return;
    }

    for (const migration of this.migrations) {
      let computedName = '';
      try {
        computedName = await migration.getName();
      } catch (ex) {
        this.logger.error(
          `Error: cannot add migration, because function 'getName()' is not implemented!`,
        );
        this.logger.error(`Skipping this migration!`);
        continue;
      }

      // Cleanup the name
      computedName = computedName.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 60);

      this.registeredMigrations.push({
        computedName,
        migration,
      });
    }

    this.logger.debug(
      `prepareTenantMigrations: prepared migrations: ${this.registeredMigrations
        .map(m => m.computedName)
        .join(', ')}`,
    );
  }

  private async isTenantMigratedByMigration(
    migrationName: string,
    tenantId: string,
  ): Promise<boolean> {
    const key = `MIGRATED_${migrationName}_${tenantId}`;

    // Check if already migrated
    const ret = this.cache.get<boolean>(key);
    if (ret === true) {
      return true;
    }

    // Otherwise check it at the database
    const count = (await this.conn.query(
      `SELECT COUNT(id) AS n FROM \`${this.migrationTableName}\` WHERE name = ? AND tenant_id = ?`,
      [migrationName, tenantId],
    )) as Array<{ n: string }>;
    const n = Number(count[0].n);

    // Okay, found
    if (n > 0) {
      this.cache.set(key, true);
      return true;
    }

    return false;
  }

  private async markMigrationDone(migrationName: string, tenantId: string): Promise<void> {
    const key = `MIGRATED_${migrationName}_${tenantId}`;
    await this.conn.query(
      `INSERT INTO \`${this.migrationTableName}\` (\`name\`, \`tenant_id\`) VALUES (?, ?)`,
      [migrationName, tenantId],
    );
    this.cache.set(key, true);
  }

  private async newTenantInterceptor(auth: AuthInfo) {
    if (Array.isArray(this.allowNoTenants) && this.allowNoTenants.length > 0 && !auth.tenantId) {
      this.logger.debug(`Ignoring route, because no tenant id set!`);
      return;
    }

    // The migrations are currently executed
    const _release = await this.mutex.acquire(auth.tenantId);

    for (const migration of this.registeredMigrations) {
      const isMigr = await this.isTenantMigratedByMigration(migration.computedName, auth.tenantId);

      if (!isMigr) {
        this.logger.info(
          `Migration '${migration.computedName}' not executed for tenant #${auth.tenantId}`,
        );

        // Run it
        try {
          this.logger.info(`Executing '${migration.computedName}'@${auth.tenantId} ...`);
          await migration.migration.up(auth.tenantId, auth);
          this.logger.info(`Done`);
          await this.markMigrationDone(migration.computedName, auth.tenantId);
        } catch (ex) {
          this.logger.error(`Migration '${migration.computedName}'@${auth.tenantId} failed:`, ex);
          _release();
          throw ex;
        }
      }
    }

    _release();
  }
}
