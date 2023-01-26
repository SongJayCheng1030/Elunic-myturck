import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ExecutionState } from 'shared/common/models';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { AssetAssignmentEntity } from '../../asset-assignment/entities/asset-assignment.entity';
import { TABLE_PREFIX } from '../../definitions';
import { ProcedureStepEntity } from '../../procedure-step/entities/maintenance-procedure-step.entity';
import { BaseModel } from '../../shared/entities/base';
import { ExecutionStepResultEntity } from './maintenance-execution-step-result.entity';

@Entity({ name: `${TABLE_PREFIX}_execution_entity` })
export class ExecutionEntity extends BaseModel {
  @ApiResponseProperty({ type: Date })
  @Column({ type: 'datetime' })
  dueDate!: Date;

  @ApiProperty({ type: Date, readOnly: true, nullable: true })
  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date | null;

  @ApiProperty({ type: String, readOnly: true, nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  completedBy!: string | null;

  @ApiResponseProperty({ enum: ExecutionState })
  @Column({ type: 'enum', enum: ExecutionState })
  state!: ExecutionState;

  @ApiProperty({ type: Boolean, nullable: true })
  @Column({ type: 'boolean', nullable: false })
  latestExecution!: boolean;

  @ManyToOne(
    () => AssetAssignmentEntity,
    assignment => assignment.executions,
  )
  @Exclude()
  assignment!: AssetAssignmentEntity;

  @OneToMany(
    () => ExecutionStepResultEntity,
    stepResult => stepResult.execution,
    { onDelete: 'CASCADE' },
  )
  @ApiProperty({
    type: () => ExecutionStepResultEntity,
    isArray: true,
    required: false,
    readOnly: true,
  })
  @Type(() => ExecutionStepResultEntity)
  stepResults!: ExecutionStepResultEntity[];

  @ApiResponseProperty({ type: Number })
  @Expose()
  get completedSteps() {
    return this.stepResults.length;
  }

  @ApiResponseProperty({ type: Number })
  @Expose()
  get totalSteps() {
    return this.assignment.procedure.steps.length;
  }

  @ApiResponseProperty({ type: Number })
  @Expose()
  get totalMandatorySteps() {
    return this.assignment.procedure.steps.filter(s => s.mandatory).length;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureId() {
    return this.assignment.procedure._id;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureName() {
    return this.assignment.procedure.name;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureDescription() {
    return this.assignment.procedure.description;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureInterval() {
    return this.assignment.procedure.interval;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureIntervalUnit() {
    return this.assignment.procedure.intervalUnit;
  }

  @ApiPropertyOptional({ type: String, readOnly: true })
  @Expose()
  get procedureVersion() {
    const procedure = this.assignment.procedure;
    const index = procedure.root?.derivatives
      ?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .findIndex(d => d.id === procedure.id);
    return typeof index === 'number' ? index + 2 : undefined;
  }

  @ApiProperty({
    type: () => ProcedureStepEntity,
    isArray: true,
    required: false,
    readOnly: true,
  })
  @Expose()
  @Type(() => ProcedureStepEntity)
  get procedureSteps() {
    return this.assignment.procedure.steps.sort((a, b) => a.position - b.position);
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get assetId() {
    return this.assignment.assetId;
  }
}
