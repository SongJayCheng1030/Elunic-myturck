import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import * as NodeCache from 'node-cache';
import { AuthInfo } from 'shared/common/types';
import { Connection, Repository } from 'typeorm';

import { SettingEntity } from './settings.entity';

@Injectable()
export class SettingsService {
  private cache: NodeCache = new NodeCache({ stdTTL: 0 });

  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingsRepo: Repository<SettingEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectLogger('SettingsService')
    private readonly logger: Logger,
  ) {}

  async findAll(authInfo: AuthInfo): Promise<SettingEntity[]> {
    const all = await this.settingsRepo.find({
      where: {
        tenantId: authInfo.tenantId,
      },
    });

    return all || [];
  }

  async set(
    authInfo: AuthInfo,
    values: { [key: string]: string | boolean | number },
  ): Promise<void> {
    await this.connection.transaction(async em => {
      const repo = em.getRepository<SettingEntity>(SettingEntity);

      for (const key in values) {
        const normKey = `${key || ''}`.toUpperCase();

        await repo.update(
          {
            key: normKey,
            tenantId: authInfo.tenantId,
          },
          {
            value: `${values[key] || ''}`,
            updatedAt: new Date(),
          },
        );
      }
    });
  }

  async getString(authInfo: AuthInfo, key: string, defaultValue?: string): Promise<string | null> {
    const normKey = `${key || ''}`.toUpperCase();
    const uid = `${normKey}_${authInfo.tenantId}`;

    const cached = this.cache.get(uid);
    if (cached !== null && cached !== undefined) {
      return cached as string;
    }

    const ret = await this.settingsRepo.findOne({
      where: {
        tenantId: authInfo.tenantId,
        key: normKey,
      },
    });

    if (!ret) {
      if (defaultValue !== undefined) {
        return defaultValue;
      } else {
        return null;
      }
    }

    this.cache.set(uid, ret.value);
    return ret.value;
  }

  async getNumber(authInfo: AuthInfo, key: string, defaultValue?: number): Promise<number | null> {
    const ret = await this.getString(authInfo, key, `${defaultValue || ''}`);

    if (!ret) {
      return null;
    }

    return Number(ret);
  }

  async getNumberAsFractionalPercent(
    authInfo: AuthInfo,
    key: string,
    defaultValue: number,
  ): Promise<number> {
    const defn = Math.min(1, Math.max(0, defaultValue));
    const raw = await this.getNumber(authInfo, key, defn);

    if (raw === null) {
      return defn;
    }

    return Math.min(100, Math.max(0, raw)) / 100.0;
  }

  async getBool(authInfo: AuthInfo, key: string, defaultValue?: boolean): Promise<boolean | null> {
    const ret = await this.getString(authInfo, key, `${defaultValue || ''}`);

    if (!ret) {
      return null;
    }

    return ['true', '1', 'on', 'yes'].includes(`${ret} || ''`.toLowerCase());
  }
}
