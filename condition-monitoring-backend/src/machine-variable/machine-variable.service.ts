import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { Repository } from 'typeorm';

import { UpdateVariableDto } from './dto/update-variable';
import { MachineVariableEntity } from './machine-variable.entity';

@Injectable()
export class MachineVariableService extends TypeOrmCrudService<MachineVariableEntity> {
  constructor(
    @InjectRepository(MachineVariableEntity)
    private machineVariableRepo: Repository<MachineVariableEntity>,
  ) {
    super(machineVariableRepo);
  }

  async updateMachineVariable(id: string, dto: UpdateVariableDto) {
    const variable = await this.machineVariableRepo.findOne(id);
    if (!variable) {
      throw new NotFoundException(`No such variable`);
    }

    Object.assign(variable, dto);

    return this.machineVariableRepo.save(variable);
  }
}
