import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { StepType } from 'shared/common/models';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { BaseModel } from '../../shared/entities/base';
import { ProcedureStepContentDto } from '../dto/procedure-step.dto';
import { ProcedureStepEntity } from './maintenance-procedure-step.entity';
import { StepTagEntity } from './step-tag.entity';

@Entity({ name: `${TABLE_PREFIX}_procedure_library_step_entity` })
@Unique(`UNIQ___procedure_library_step_entity_name`, ['tenantId', 'name'])
export class ProcedureLibraryStepEntity extends BaseModel {
  @ApiProperty()
  @Column()
  name!: string;

  @ApiProperty()
  @Column()
  description!: string;

  @ApiProperty()
  @Column()
  mandatory!: boolean;

  @ApiProperty()
  @Column()
  skippable!: boolean;

  @ApiProperty({ enum: StepType })
  @Column({ type: 'enum', enum: StepType })
  type!: StepType;

  @ApiProperty({ readOnly: true, nullable: true })
  @Column({ nullable: true })
  key?: string;

  @ApiProperty()
  @Column({ type: 'json' })
  content!: ProcedureStepContentDto;

  @ApiProperty()
  @Column()
  machineVariableId?: string;

  @ApiProperty()
  @Column()
  rangeFrom?: number;

  @ApiProperty()
  @Column()
  rangeTo?: number;

  @OneToMany(
    () => ProcedureStepEntity,
    step => step.parent,
  )
  steps!: ProcedureStepEntity[];

  @ApiProperty({ type: String, isArray: true })
  @ManyToMany(() => StepTagEntity, { eager: true, cascade: true })
  @JoinTable({
    name: `${TABLE_PREFIX}_step_tag_to_procedure_library_step`,
    joinColumns: [
      {
        name: 'step_id',
        referencedColumnName: 'id',
      },
    ],
    inverseJoinColumns: [
      {
        name: 'tag_name',
        referencedColumnName: 'name',
      },
      {
        name: 'tenant_id',
        referencedColumnName: 'tenantId',
      },
    ],
  })
  tags!: StepTagEntity[];

  @Expose({ name: 'tags' })
  get _tags() {
    return (this.tags || []).map(t => t.name);
  }
}
