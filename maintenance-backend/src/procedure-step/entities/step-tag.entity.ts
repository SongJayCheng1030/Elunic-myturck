import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { ProcedureLibraryStepEntity } from './maintenance-procedure-library-step.entity';

@Entity({ name: `${TABLE_PREFIX}_step_tag_entity` })
export class StepTagEntity {
  @ApiResponseProperty()
  @PrimaryColumn()
  name!: string;

  @ApiResponseProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiResponseProperty()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @PrimaryColumn({ select: false, type: 'char', length: 36 })
  tenantId!: string;

  @ManyToMany(() => ProcedureLibraryStepEntity)
  @JoinTable({
    name: `${TABLE_PREFIX}_step_tag_to_procedure_library_step`,
    joinColumns: [
      {
        name: 'tag_name',
        referencedColumnName: 'name',
      },
    ],
    inverseJoinColumns: [
      {
        name: 'step_id',
        referencedColumnName: 'id',
      },
      {
        name: 'tenant_id',
        referencedColumnName: 'tenantId',
      },
    ],
  })
  steps!: ProcedureLibraryStepEntity[];
}
