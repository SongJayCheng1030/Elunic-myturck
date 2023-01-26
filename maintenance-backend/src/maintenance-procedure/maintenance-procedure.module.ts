import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetAssignmentModule } from '../asset-assignment/asset-assignment.module';
import { AssetAssignmentEntity } from '../asset-assignment/entities/asset-assignment.entity';
import { ExecutionEntity } from '../maintenance-execution/entities/maintenance-execution.entity';
import { ProcedureLibraryStepEntity } from '../procedure-step/entities/maintenance-procedure-library-step.entity';
import { ProcedureStepEntity } from '../procedure-step/entities/maintenance-procedure-step.entity';
import { ProcedureEntity } from './entities/maintenance-procedure.entity';
import { ProcedureController } from './maintenance-procedure.controller';
import { ProcedureService } from './maintenance-procedure.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcedureEntity,
      ProcedureStepEntity,
      ProcedureLibraryStepEntity,
      AssetAssignmentEntity,
      ExecutionEntity,
    ]),
    AssetAssignmentModule,
  ],
  providers: [ProcedureService],
  exports: [ProcedureService],
  controllers: [ProcedureController],
})
export class ProcedureModule {}
