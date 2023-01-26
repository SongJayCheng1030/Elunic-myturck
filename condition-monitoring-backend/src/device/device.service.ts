import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { uniqBy } from 'lodash';
import { TENANT_DEVICE_GROUP_SETTING_KEY } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { DataResponse, SharedApiService, SharedService } from 'shared/nestjs';
import { GrafanaDataSource } from 'src/organization/grafana.service';
import { Repository } from 'typeorm';

import { OrganizationEntity } from '../organization/organization.entity';
import { DataSinkEntity } from './data-sink.entity';
import { SensorDto } from './device.dto';
import { DeviceEntity } from './device.entity';
import { SensorEntity } from './sensor.entity';
import { DataSink, DeviceSource } from './sources';

@Injectable()
export class DeviceService implements OnModuleInit {
  private get publicSources() {
    return this.dataSinks.filter(s => s.public);
  }

  constructor(
    @InjectRepository(DeviceEntity) private readonly deviceRepo: Repository<DeviceEntity>,
    @InjectRepository(SensorEntity) private readonly sensorRepo: Repository<SensorEntity>,
    @InjectRepository(DataSinkEntity) private readonly sinkRepo: Repository<DataSinkEntity>,
    @InjectRepository(OrganizationEntity) private readonly orgRepo: Repository<OrganizationEntity>,
    @Inject('DATA_SINKS') private readonly dataSinks: DataSink[],
    @InjectLogger(DeviceService.name) private readonly logger: LogService,
    private readonly deviceSource: DeviceSource,
    private readonly apiService: SharedApiService,
  ) {}

  async onModuleInit() {
    await this.fetchSensors();
  }

  async getOne(authInfo: AuthInfo, id: string): Promise<DeviceEntity> {
    const organization = await this.getOrg(authInfo);
    const entity = await this.deviceRepo.findOneOrFail({
      where: { id, organization },
    });
    return entity;
  }

  async getMany(authInfo: AuthInfo): Promise<DeviceEntity[]> {
    const organization = await this.getOrg(authInfo);
    const entities = await this.deviceRepo.find({
      where: { organization },
    });
    return entities;
  }

  async createOne(authInfo: AuthInfo, id: string) {
    const organization = await this.getOrg(authInfo);
    const device = await this.deviceRepo.save({ id, organization });
    await this.createSinks(device);
    return device;
  }

  async createMany(orgId: string, deviceIds: string[]) {
    const devices = await this.deviceRepo.save(
      deviceIds.map(id => ({ id, organization: { id: orgId } })),
    );
    for (const device of devices) {
      await this.createSinks(device);
    }
    return devices;
  }

  async getAvailableIds(auth: AuthInfo): Promise<string[]> {
    const groupId = await this.getDeviceGroup(auth);
    return this.deviceSource.getAvailableDeviceIds(groupId);
  }

  async searchSensor(auth: AuthInfo, q?: string): Promise<SensorDto[]> {
    const groupId = await this.getDeviceGroup(auth);
    let qb = this.sensorRepo
      .createQueryBuilder('sensor')
      .where('sensor.group_id = :groupId', { groupId });
    if (q) {
      qb = qb.andWhere('sensor.id LIKE :q', { q: `%${q}%` });
    }
    const sensors = await qb.orderBy('id', 'DESC').limit(25).getMany();

    return uniqBy(
      sensors.map(s => ({ id: s.id, type: s.type })),
      'id',
    );
  }

  async getAvailableSensors(auth: AuthInfo, id?: string): Promise<SensorDto[]> {
    const groupId = await this.getDeviceGroup(auth);

    if (!id) {
      const sensors = await this.sensorRepo.find({ groupId });
      return sensors.map(s => ({ id: s.id, type: s.type }));
    }

    const deviceIds = await this.deviceSource.getAvailableDeviceIds(groupId);
    if (!deviceIds.includes(id)) {
      throw new NotFoundException('Device');
    }

    const deviceSensors = await this.sensorRepo.find({ groupId, deviceId: id });
    return deviceSensors.map(s => ({ id: s.id, type: s.type }));
  }

  async getGrafanaConfigs(orgId: string, sinks: DataSinkEntity[]): Promise<GrafanaDataSource[]> {
    const promises: Array<Promise<GrafanaDataSource>> = [];
    for (const sink of this.publicSources) {
      const sinkIds = sinks.filter(s => s.type === sink.type).map(s => s.id);
      if (sinkIds.length) {
        promises.push(sink.getGrafanaConfig(orgId, sinkIds));
      }
    }
    return Promise.all(promises);
  }

  async updateGrafanaConfig(
    orgId: string,
    type: string,
    sinks: DataSinkEntity[],
  ): Promise<Partial<GrafanaDataSource> | undefined> {
    const sink = this.publicSources.find(s => s.type === type);
    if (!sink) {
      return undefined;
    }

    const sinkIds = sinks.filter(s => s.type === sink.type).map(s => s.id);
    return sink.updateGrafanaConfig(orgId, sinkIds);
  }

  async getOneByAssetId(authInfo: AuthInfo, assetId: string): Promise<DeviceEntity | undefined> {
    const organization = await this.getOrg(authInfo);
    const entity = await this.deviceRepo.findOne({
      where: { assetId, organization },
    });
    return entity;
  }

  async assignDevice(authInfo: AuthInfo, id: string, assetId: string): Promise<DeviceEntity> {
    const device = await this.getOne(authInfo, id);

    device.assetId = assetId;
    try {
      return await this.deviceRepo.save(device);
    } catch (ex: any) {
      if (ex.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(`Asset with ID ${assetId} already has a assigned device`);
      }
      this.logger.warn(`Failed to assign asset:`, ex);
      throw new InternalServerErrorException(
        `Device ${id} could not be assigned to asset ID: ${assetId}`,
      );
    }
  }

  async unassignDevice(authInfo: AuthInfo, id: string): Promise<DeviceEntity> {
    const device = await this.getOne(authInfo, id);
    device.assetId = null;
    return this.deviceRepo.save(device);
  }

  private async createSinks(device: DeviceEntity) {
    const sinks = await Promise.all(this.publicSources.map(s => s.createSink(device.id, {})));
    const sinkEntities: DataSinkEntity[] = [];
    for (const sink of sinks) {
      sinkEntities.push(
        await this.sinkRepo.save({
          id: sink.id,
          name: sink.name,
          type: sink.type,
          device,
          config: sink.config,
        }),
      );
    }
    return sinkEntities;
  }

  private getOrg(authInfo: AuthInfo) {
    return this.orgRepo.findOneOrFail({
      where: { tenantId: authInfo.tenantId },
    });
  }

  private async getDeviceGroup(auth: AuthInfo): Promise<string> {
    const res = await this.apiService.httpGetOrFail<DataResponse<{ value: string }>>(
      auth,
      SharedService.USER_SERVICE,
      `v1/tenant-settings/${TENANT_DEVICE_GROUP_SETTING_KEY}`,
    );

    const groupId = res.data.data.value;
    if (!groupId) {
      throw new NotAcceptableException('Tenant needs to be assigned to a device group');
    }

    return groupId;
  }

  @Cron('*/10 * * * *')
  private async fetchSensors() {
    this.logger.debug('Fetching available sensors');
    try {
      const groups = await this.deviceSource.getAvailableGroupIds();
      const inserts: SensorEntity[] = [];
      for (const groupId of groups) {
        const deviceIds = await this.deviceSource.getAvailableDeviceIds(groupId);
        for (const deviceId of deviceIds) {
          const sensors = await this.deviceSource.getAvailableSensors(deviceId);
          inserts.push(
            ...sensors.map<SensorEntity>(s => ({
              id: s.id,
              deviceId,
              groupId,
              type: s.type,
            })),
          );
        }
      }
      this.logger.debug(`Found ${inserts.length} sensors to sync`);
      await this.sensorRepo.save(inserts);
    } catch (e) {
      this.logger.error('Could not fetch sensors', e);
    }
  }
}
