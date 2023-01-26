import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pick } from 'lodash';
import {
  MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY,
  MAINTENANCE_INTERVAL_SETTING,
  TENANT_DEVICE_GROUP_SETTING_KEY,
} from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { Not, Repository } from 'typeorm';

import { TenantEntity } from '../tenant/tenant.entity';
import { C8yGroupService } from './c8y-group.service';
import { GroupDto } from './dto/GroupDto';
import { UpdateTenantSettingsClassDto } from './dto/UpdateTenantSettingsDto';
import { TenantSettingsEntity } from './tenant-settings.entity';

interface TennantSettingDefault {
  key: string;
  value: string;
  isImmutable?: boolean;
  unique?: boolean;
}

const TENANT_SETTINGS_DEFAULTS: TennantSettingDefault[] = [
  {
    key: MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY,
    value: MAINTENANCE_INTERVAL_SETTING.ON_EXECUTION,
  },
  {
    key: TENANT_DEVICE_GROUP_SETTING_KEY,
    value: '',
    isImmutable: true,
    unique: true,
  },
];

@Injectable()
export class TenantSettingsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettingsRepo: Repository<TenantSettingsEntity>,
    @InjectLogger(`TenantSettingsService`)
    private readonly logger: Logger,
    private c8yGroupService: C8yGroupService,
  ) {}

  /**
   * Initializes default tenant settings for all tenants
   */
  async init() {
    const tenants = await this.tenantRepo.find();
    for (const tenant of tenants) {
      await this.createDefaultSettings(tenant.id);
    }
    this.logger.info(`Initializes default tenant settings finished.`);
  }

  async createDefaultSettings(tenantId: string) {
    for (const defaultSetting of TENANT_SETTINGS_DEFAULTS) {
      const count = await this.tenantSettingsRepo.count({
        tenantId,
        key: defaultSetting.key,
      });
      if (!count) {
        const tenantSettings = this.tenantSettingsRepo.create({
          tenantId,
          key: defaultSetting.key,
          value: defaultSetting.value,
        });
        await this.tenantSettingsRepo.save(tenantSettings);
      }
    }
  }

  /**
   * Returns a list of all tenant settings.
   *
   * @param authInfo The user session to filter the result
   * @returns An array of `TenantSettingsEntity` objects at least zero
   */
  async findAll(authInfo: AuthInfo): Promise<TenantSettingsEntity[]> {
    return await this.tenantSettingsRepo.find({
      where: { tenantId: authInfo.tenantId },
    });
  }

  /**
   * Finds a tenant settings by its key.
   *
   * @param tenantId The tenant id to filter the result
   * @param key The key of the tenant settings to find
   * @returns The tenant settings object or an exception is thrown
   */
  async getOneByKey(tenantId: string, key: string): Promise<TenantSettingsEntity> {
    const tenantSetting = await this.tenantSettingsRepo.findOne({
      tenantId,
      key,
    });
    if (!tenantSetting) {
      throw new NotFoundException(`No such tenant setting`);
    }
    return tenantSetting;
  }

  /**
   * Updates the value of a tenant settings by key.
   *
   * @param tenantId The tenant id to filter the result
   * @param key
   * @param dto
   * @returns
   */
  async updateOne(
    auth: AuthInfo,
    tenantId: string,
    key: string,
    dto: Partial<UpdateTenantSettingsClassDto>,
  ): Promise<TenantSettingsEntity> {
    const tenantSetting = await this.getOneByKey(tenantId, key);
    const defaultSetting = TENANT_SETTINGS_DEFAULTS.find(setting => setting.key === key);

    if (defaultSetting?.isImmutable && tenantSetting.value) {
      throw new BadRequestException(`Tenant setting ${key} can not be updated`);
    }

    if (defaultSetting?.unique && dto.value) {
      const setting = await this.tenantSettingsRepo.findOne({
        where: {
          key,
          value: dto.value,
        },
      });
      if (setting) {
        throw new ConflictException(
          `Tenant setting ${key} with value ${dto.value} already assigned.`,
        );
      }
    }

    Object.assign(tenantSetting, pick(dto, ['value']));
    await this.tenantSettingsRepo.save(tenantSetting, { reload: true });

    this.logger.debug(`update(..., ${tenantSetting.id}, ...): entity updated`);
    return tenantSetting;
  }

  async getAvailableC8yGroups(): Promise<GroupDto[]> {
    // fetch all cumulocity group ids already connected to a tennant
    const settingsPromise = this.tenantSettingsRepo.find({
      where: {
        key: TENANT_DEVICE_GROUP_SETTING_KEY,
        value: Not(''),
      },
    });

    const [c8yGroups, settings] = await Promise.all([
      this.c8yGroupService.getGroups(),
      settingsPromise,
    ]);

    // filter connected groups from the cumulocity group response
    return c8yGroups.filter(c8yGroup => !settings.some(setting => setting.value === c8yGroup.id));
  }

  async getC8yGroup(tenantId: string): Promise<GroupDto> {
    const setting = await this.tenantSettingsRepo.findOneOrFail({
      where: {
        key: TENANT_DEVICE_GROUP_SETTING_KEY,
        tenantId,
      },
    });

    return this.c8yGroupService.getGroupById(setting.value);
  }
}
