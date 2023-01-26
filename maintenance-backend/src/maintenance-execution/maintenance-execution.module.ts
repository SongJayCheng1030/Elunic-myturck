import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcedureStepEntity } from '../procedure-step/entities/maintenance-procedure-step.entity';
import { ExecutionEntity } from './entities/maintenance-execution.entity';
import { ExecutionStepResultEntity } from './entities/maintenance-execution-step-result.entity';
import { ExecutionController } from './maintenance-execution.controller';
import { ExecutionService } from './maintenance-execution.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionEntity, ExecutionStepResultEntity, ProcedureStepEntity]),
  ],
  providers: [ExecutionService],
  exports: [ExecutionService],
  controllers: [ExecutionController],
})
export class ExecutionModule {}
