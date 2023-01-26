import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExecutionModule } from '../maintenance-execution/maintenance-execution.module';
import { ProcedureEntity } from '../maintenance-procedure/entities/maintenance-procedure.entity';
import { AssetAssignmentController } from './asset-assignment.controller';
import { AssetAssignmentService } from './asset-assignment.service';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetAssignmentEntity, ProcedureEntity]), ExecutionModule],
  providers: [AssetAssignmentService],
  exports: [AssetAssignmentService],
  controllers: [AssetAssignmentController],
})
export class AssetAssignmentModule {}
