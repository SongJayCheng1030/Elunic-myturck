import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Connection, EntityManager } from 'typeorm';

import { CreateGeneralSetting } from './dto/CreateGeneralSettingDto';
import { GeneralEntity } from './general.entity';

@Injectable()
export class GeneralService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}
  generalRepo = this.connection.getRepository<GeneralEntity>(GeneralEntity);

  async getGeneralSettings(authInfo: AuthInfo): Promise<GeneralEntity[] | undefined> {
    const setting = await this.generalRepo.find({ tenantId: authInfo.tenantId });
    if (setting) {
      return setting;
    } else {
      return undefined;
    }
  }

  async createGeneralSetting(
    authInfo: AuthInfo,
    createData: CreateGeneralSetting[],
  ): Promise<GeneralEntity[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      const generalRepo = entityManager.getRepository(GeneralEntity);
      const configs = await generalRepo.save(
        createData.map(item => ({ ...item, tenantId: authInfo.tenantId })),
        { reload: true },
      );
      return configs;
    });
  }

  async updateGeneralSetting(
    authInfo: AuthInfo,
    updateData: Array<Partial<CreateGeneralSetting>>,
  ): Promise<GeneralEntity[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      const generalRepo = entityManager.getRepository(GeneralEntity);
      const configs = await generalRepo.save(
        updateData.map(item => ({ ...item, tenantId: authInfo.tenantId })),
        { reload: true },
      );
      return configs;
    });
  }
}
