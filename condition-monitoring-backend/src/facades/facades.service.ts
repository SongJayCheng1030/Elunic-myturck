import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Repository } from 'typeorm';

import { FacadeEntity } from './facade.entity';

@Injectable()
export class FacadesService {
  constructor(
    @InjectRepository(FacadeEntity)
    private readonly facadesRepo: Repository<FacadeEntity>,
    @InjectLogger('FacadesService')
    private readonly logger: Logger,
  ) {}

  async findAll(authInfo: AuthInfo): Promise<FacadeEntity[]> {
    return (
      (await this.facadesRepo.find({
        where: {
          tenantId: authInfo.tenantId,
        },
      })) || []
    );
  }
}
