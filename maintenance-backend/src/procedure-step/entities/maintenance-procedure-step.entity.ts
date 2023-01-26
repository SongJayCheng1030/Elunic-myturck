import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { StepType } from 'shared/common/models';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { ExecutionStepResultEntity } from '../../maintenance-execution/entities/maintenance-execution-step-result.entity';
import { ProcedureEntity } from '../../maintenance-procedure/entities/maintenance-procedure.entity';
import { BaseModel } from '../../shared/entities/base';
import { ProcedureStepContentDto } from '../dto/procedure-step.dto';
import { ProcedureLibraryStepEntity } from './maintenance-procedure-library-step.entity';

@Entity({ name: `${TABLE_PREFIX}_procedure_step_entity` })
@Unique(`UNIQ___procedure_step_entity_procedure_key`, ['tenantId', 'procedure', 'key'])
@Unique(`UNIQ___procedure_step_entity_procedure_name`, ['tenantId', 'procedure', 'name'])
export class ProcedureStepEntity extends BaseModel {
  @ApiResponseProperty()
  @Column()
  name!: string;

  @ApiResponseProperty()
  @Column()
  description!: string;

  @ApiResponseProperty()
  @Column()
  mandatory!: boolean;

  @ApiResponseProperty()
  @Column()
  skippable!: boolean;

  @ApiResponseProperty({ enum: StepType })
  @Column({ type: 'enum', enum: StepType })
  type!: StepType;

  @ApiProperty({ readOnly: true, nullable: true })
  @Column({ nullable: true })
  key?: string;

  @ApiProperty()
  @Column({ type: 'json' })
  content!: ProcedureStepContentDto;

  @ApiResponseProperty()
  @Column()
  position!: number;

  @ApiProperty()
  @Column()
  machineVariableId?: string;

  @ApiProperty()
  @Column()
  rangeFrom?: number;

  @ApiProperty()
  @Column()
  rangeTo?: number;

  @ManyToOne(
    () => ProcedureEntity,
    procedure => procedure.steps,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  @Exclude()
  procedure!: ProcedureEntity;

  @OneToMany(
    () => ExecutionStepResultEntity,
    result => result.step,
    { onDelete: 'CASCADE' },
  )
  @Exclude()
  stepResults!: ExecutionStepResultEntity[];

  @ManyToOne(
    () => ProcedureLibraryStepEntity,
    libStep => libStep.steps,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn()
  @Exclude()
  parent?: ProcedureLibraryStepEntity;

  @ApiPropertyOptional({ type: String, readOnly: true })
  @Expose()
  get parentId() {
    return this.parent?.id;
  }
}
