import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { StepResultStatus } from 'shared/common/models';
import { Column, Entity, ManyToOne } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { ProcedureStepEntity } from '../../procedure-step/entities/maintenance-procedure-step.entity';
import { BaseModel } from '../../shared/entities/base';
import { ExecutionEntity } from './maintenance-execution.entity';

@Entity({ name: `${TABLE_PREFIX}_execution_step_result_entity` })
export class ExecutionStepResultEntity extends BaseModel {
  @ApiResponseProperty({ enum: StepResultStatus })
  @Column({ type: 'enum', enum: StepResultStatus })
  status!: StepResultStatus;

  @ApiPropertyOptional({ readOnly: true })
  @Column({ nullable: true, type: 'json' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;

  @ManyToOne(
    () => ExecutionEntity,
    execution => execution.stepResults,
    { onDelete: 'CASCADE' },
  )
  @Exclude()
  execution!: ExecutionEntity;

  @ManyToOne(
    () => ProcedureStepEntity,
    step => step.stepResults,
  )
  @Exclude()
  step!: ProcedureStepEntity;

  @Expose()
  @ApiProperty({ type: String })
  get procedureStepId() {
    return this.step.id;
  }
}
