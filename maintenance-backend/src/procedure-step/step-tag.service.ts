import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Repository } from 'typeorm';

import { StepTagEntity } from './entities/step-tag.entity';

@Injectable()
export class StepTagService {
  constructor(
    @InjectRepository(StepTagEntity)
    private tagRepo: Repository<StepTagEntity>,
  ) {}
  async all(authInfo: AuthInfo): Promise<StepTagEntity[]> {
    return await this.tagRepo.find({
      where: {
        tenantId: authInfo.tenantId,
      },
      order: {
        name: 'ASC',
      },
    });
  }
}
