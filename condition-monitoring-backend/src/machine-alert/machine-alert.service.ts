import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { Repository } from 'typeorm';

import { MachineAlertEntity } from './machine-alert.entity';

@Injectable()
export class MachineAlertService extends TypeOrmCrudService<MachineAlertEntity> {
  constructor(
    @InjectRepository(MachineAlertEntity)
    private machineAlertRepo: Repository<MachineAlertEntity>,
  ) {
    super(machineAlertRepo);
  }
}
