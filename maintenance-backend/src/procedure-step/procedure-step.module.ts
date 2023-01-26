import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcedureLibraryStepEntity } from './entities/maintenance-procedure-library-step.entity';
import { StepTagEntity } from './entities/step-tag.entity';
import { ProcedureStepController } from './procedure-step.controller';
import { ProcedureStepService } from './procedure-step.service';
import { StepTagController } from './step-tag.controller';
import { StepTagService } from './step-tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcedureLibraryStepEntity, StepTagEntity])],
  providers: [ProcedureStepService, StepTagService],
  exports: [ProcedureStepService, StepTagService],
  controllers: [ProcedureStepController, StepTagController],
})
export class ProcedureStepModule {}
